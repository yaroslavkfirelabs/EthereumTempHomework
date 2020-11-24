pragma solidity >=0.4.22 <0.8.0;

contract MultisigWallet {

    event Execution(uint transactionId);
    event ExecutionFailure(uint transactionId);
    event Submitted(uint transactionId, address submitter);
    event Confirmed(uint transactionId, address confirmer);

    struct Transaction {
        address receiver;
        uint value;
        bytes data;
        bool executed;
    }

    address[] owners;
    mapping(address => bool) public isOwner;
    uint requiredSigs;

    mapping(uint => Transaction) public transactions;
    mapping(uint => mapping (address => bool)) public confirmations;
    uint public transactionCount;

    modifier ownerExists(address owner) {
        require(
            isOwner[owner],
            "Caller should be in owners"
        );
        _;
    }

    modifier transactionExists(uint transactionId) {
        require(
            transactions[transactionId].receiver != address(0x0),
            "Transaction by that id does not exist"
        );
        _;
    }

    constructor(address[] memory _owners, uint _requiredSigs) public {  
	    owners = _owners;
        requiredSigs = _requiredSigs;
        for (uint i=0; i<owners.length; i++) {
            isOwner[owners[i]] = true;
        }
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getRequiredSigs() public view returns (uint) {
        return requiredSigs;
    }

    function getTransactionById(uint transactionId) public view returns (
        address receiver,
        uint value,
        bytes memory data,
        bool executed) {
        
        Transaction memory transaction = transactions[transactionId];
        receiver = transaction.receiver;
        value = transaction.value;
        data = transaction.data;
        executed = transaction.executed;
    }

    function submitTransaction(address receiver, uint value, bytes memory data) public payable returns (uint transactionId) {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            receiver: receiver,
            value: value,
            data: data,
            executed: false
        });
        transactionCount += 1;
        emit Submitted(transactionId, msg.sender);

        confirmTransaction(transactionId);
    }

    function confirmTransaction(uint transactionId) 
        public 
        ownerExists(msg.sender) 
        transactionExists(transactionId) {
        require(
            confirmations[transactionId][msg.sender] == false, 
            "Already confirmed"
        );

        confirmations[transactionId][msg.sender] = true;
        emit Confirmed(transactionId, msg.sender);

        uint count = 0;
        for (uint i=0; i<owners.length; i++) {
            if (confirmations[transactionId][owners[i]]) {
                count += 1;
            }
            if (count == requiredSigs) {
                executeTransaction(transactionId);
                return;
            }
        }
    }

    function executeTransaction(uint transactionId) private {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.executed == false, 'Transaction is already executed');
        transaction.executed = true;
        (bool success,) = transaction.receiver.call{value: transaction.value}(transaction.data);
        if (success) {
            emit Execution(transactionId);
        } else {
            transaction.executed = false;
            emit ExecutionFailure(transactionId);
        }
    }
}