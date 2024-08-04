import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [newAmount, setNewAmount] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isIncome, setIsIncome] = useState(true); // Default to income

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>Please connect your Metamask wallet</button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <div>
          <h2>Financial Transactions</h2>
          <label>
            <input
              type="radio"
              name="transactionType"
              checked={isIncome}
              onChange={() => setIsIncome(true)}
            />
            Income
          </label>
          <label>
            <input
              type="radio"
              name="transactionType"
              checked={!isIncome}
              onChange={() => setIsIncome(false)}
            />
            Expense
          </label>
          <form onSubmit={addTransaction}>
            <input
              type="number"
              placeholder="Enter amount"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <button type="submit">Add Transaction</button>
          </form>
          <h3>Expenses</h3>
          <ul>
            {expenses.map((expense, index) => (
              <li key={index}>
                Amount: {expense.amount}, Description: {expense.description}
                <button onClick={() => removeTransaction(index, true)}>Remove</button>
              </li>
            ))}
          </ul>
          <h3>Incomes</h3>
          <ul>
            {incomes.map((income, index) => (
              <li key={index}>
                Amount: {income.amount}, Description: {income.description}
                <button onClick={() => removeTransaction(index, false)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const addTransaction = (e) => {
    e.preventDefault();
    const transaction = {
      amount: newAmount,
      description: newDescription
    };

    if (isIncome) {
      setIncomes([...incomes, transaction]);
    } else {
      setExpenses([...expenses, transaction]);
    }

    setNewAmount("");
    setNewDescription("");
  };

  const removeTransaction = (index, isExpense) => {
    if (isExpense) {
      const updatedExpenses = [...expenses];
      updatedExpenses.splice(index, 1);
      setExpenses(updatedExpenses);
    } else {
      const updatedIncomes = [...incomes];
      updatedIncomes.splice(index, 1);
      setIncomes(updatedIncomes);
    }
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
        h2 {
          margin-bottom: 10px;
        }
        form {
          margin-bottom: 10px;
        }
        input[type="number"], input[type="text"] {
          padding: 5px;
          margin-right: 10px;
        }
        button[type="submit"] {
          padding: 5px 10px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin-bottom: 5px;
        }
        button {
          margin-left: 10px;
          padding: 3px 8px;
        }
      `}</style>
    </main>
  );
}
