// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/escrow/RefundEscrow.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Products is ReentrancyGuard{
    using Counters for Counters.Counter;
    Counters.Counter private _productID;
    Counters.Counter private _orderID;

    enum OrderStatus {
        Available,
        Pending,
        Shipped,
        Delivered,
        Refunded
    }

    struct Product {
        string name;
        string category;
        string[] imageLink;
        string descLink;
        uint price;
        uint index;
        OrderStatus status;
        string location;
        uint256 maxQuantity;
        address payable owner;
        uint256 shippingFee;
        address nftAddress;
    }

    struct Order {
        uint256 orderId;
        address buyer;
        address seller;
        uint256 price;
        OrderStatus status;
        bool isPaid;
        bool isFulfilled;
        bool isRefunded;
        RefundEscrow escrow; // Instance of the Escrow contract
        uint256 amount;
        address nftAddress;
    }

    mapping(uint256 => Order) public orders;
    mapping(uint256 => Product) public products;
    mapping(address => Product[]) addressToProducts;
    mapping(address => Product) public addressToSingleProduct;
    Product[] allProduct;
    Order[] allOrders;

    event OrderCreated(
        uint256 orderId,
        address buyer,
        address seller,
        uint256 price
    );

    event OrderRefunded(uint256 orderId);

    modifier onlyBuyer(uint256 _orderId) {
        require(
            msg.sender == orders[_orderId].buyer,
            "Only the buyer can call this function."
        );
        _;
    }

    modifier onlySeller(uint256 _orderId) {
        require(
            msg.sender == orders[_orderId].seller,
            "Only the seller can call this function."
        );
        _;
    }

    function addProduct(
        string memory _name,
        string memory _category,
        string[] memory _imageLink,
        string memory _descLink,
        uint _price,
        string memory _location,
        uint256 _maxQuantity,
        uint256 _refundTimeLimit
    ) public returns (uint256) {
        require(msg.sender != address(0), "Invalid sender address.");
        uint256 productId = _productID.current();

        Product storage newProduct = products[productId];
        newProduct.name = _name;
        newProduct.owner = payable(msg.sender);
        newProduct.category = _category;
        newProduct.descLink = _descLink;
        newProduct.imageLink = _imageLink;
        newProduct.index = productId;
        newProduct.location = _location;
        newProduct.maxQuantity = _maxQuantity;
        newProduct.price = _price;
        newProduct.status = OrderStatus.Available;
        newProduct.shippingFee = _refundTimeLimit;
        allProduct.push(newProduct);
        _productID.increment();
        return productId;
    }

    function placeOrder(
        uint256 id,
        uint256 quantity
    ) public payable nonReentrant {
        uint256 orderId = _orderID.current();
        Order storage newOrder = orders[orderId];
        uint256 amount = products[id].price +
            quantity +
            products[id].shippingFee;
        require(quantity > 0, "quantity cant be zero");
        require(products[id].maxQuantity >= quantity, "out of stock");
        require(msg.value >= amount, "Insufficient payment.");
        require(!newOrder.isPaid, "Payment has already been made.");
        require(
            products[id].status == OrderStatus.Available,
            "Product is not available."
        );
        address payable _seller = products[id].owner; // Only allow the owner to sell items for now
        RefundEscrow escrowInstance = new RefundEscrow(_seller);
        escrowInstance.deposit{value: amount}(payable(msg.sender));
        newOrder.orderId = orderId;
        newOrder.buyer = msg.sender;
        newOrder.seller = _seller;
        newOrder.price = amount;
        newOrder.status = OrderStatus.Pending;
        newOrder.isPaid = true;
        newOrder.isFulfilled = false;
        newOrder.isRefunded = false;
        newOrder.escrow = escrowInstance;
        newOrder.amount = quantity;
        newOrder.nftAddress = products[id].nftAddress;

        products[id].maxQuantity -= quantity;
        allOrders.push(newOrder);
        emit OrderCreated(orderId, msg.sender, _seller, products[id].price);
    }

    event OrderDelivered(uint256 orderId);

    function confirmDelivery(
        uint256 _orderId
    ) external onlyBuyer(_orderId) nonReentrant {
        Order storage order = orders[_orderId];
        require(order.isPaid, "Payment has not been made.");
        // Call the close function in the RefundEscrow contract
        order.escrow.close();
        order.isFulfilled = true;
        emit OrderDelivered(_orderId);
    }

    function refundOrder(
        uint256 _orderId
    ) external onlySeller(_orderId) nonReentrant {
        Order storage order = orders[_orderId];
        require(order.isPaid, "Payment has not been made.");
        require(!order.isFulfilled, "Order has already been fulfilled.");
        // Call the enableRefunds function in the RefundEscrow contract
        order.escrow.enableRefunds();
        order.status = OrderStatus.Refunded;
        order.isRefunded = true;
        // Call the beneficiaryWithdraw function in the RefundEscrow contract
        order.escrow.beneficiaryWithdraw();
        emit OrderRefunded(_orderId);
    }

    function getProductDetails() external view returns (Product[] memory) {
        uint256 productCount = allProduct.length;
        Product[] memory productDetails = new Product[](productCount);
        for (uint256 i = 0; i < productCount; i++) {
            productDetails[i] = allProduct[productCount - 1 - i];
        }
        return productDetails;
    }

    function getAllOrder() external view returns (Order[] memory) {
        return allOrders;
    }

    function getProductByAddress(
        address _owner
    ) external view returns (Product[] memory) {
        return addressToProducts[_owner];
    }
}
