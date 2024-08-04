// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    struct Transaction {
        uint256 amount;
        string description;
    }

    Transaction[] public transactions;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event TransactionAdded(uint256 amount, string description);
    event TransactionRemoved(uint256 index);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        balance += _amount;
        assert(balance == _previousBalance + _amount);
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        balance -= _withdrawAmount;
        assert(balance == (_previousBalance - _withdrawAmount));
        emit Withdraw(_withdrawAmount);
    }

    function addTransaction(uint256 _amount, string memory _description) public {
        require(msg.sender == owner, "You are not the owner of this account");
        transactions.push(Transaction(_amount, _description));
        emit TransactionAdded(_amount, _description);
    }

    function removeTransaction(uint256 _index) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_index < transactions.length, "Transaction index out of bounds");
        
        // Remove the transaction by shifting elements
        for (uint i = _index; i < transactions.length - 1; i++) {
            transactions[i] = transactions[i + 1];
        }
        transactions.pop();
        
        emit TransactionRemoved(_index);
    }
}
