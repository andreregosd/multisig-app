import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { multisigWalletAbi } from '../constants/constants.js';
import { formatBalance, toWei } from '../utils/utils';
import { toast } from 'react-toastify';

function MyVaultsPage({signer, multisigFactory}) {
    const[myWallets, setMyWallets] = useState([]);
    const[activeWalletIndex, setActiveWalletIndex] = useState();
    const[showModal, setShowModal] = useState(false);
    const[newTransactionDestination, setNewTransactionDestination] = useState();
    const[newTransactionValue, setNewTransactionValue] = useState();
    const[amountToSend, setAmountToSend] = useState();

    useEffect(() => {
        if(multisigFactory) {
            setWallets();
        }
    }, [multisigFactory]);

    const setWallets = async () => {
        let wallets = [];
        let walletsAddresses = await multisigFactory.getMultisigsBySender();
        const provider = new ethers.BrowserProvider(window.ethereum);
        for(let i = 0; i < walletsAddresses.length; i++) {
            let multisigContract = new ethers.Contract(walletsAddresses[i], multisigWalletAbi, signer);
            let name = await multisigContract.getWalletName();
            let approvalsRequired = await multisigContract.getApprovalsRequired();
            let transactions = [];
            let pendingTransactions = [];
            let transactionsLength = await multisigContract.getTransactionsLength();
            for(let ii = 0; ii < transactionsLength; ii++) {
                let result = await multisigContract.getTransaction(ii);
                let approved = await multisigContract.hasApproved(ii, signer.address);
                let transaction = {
                    id: ii,
                    to: result.to,
                    value: result.value,
                    approved: approved,
                    approvals: result.approvals,
                    executed: result.executed
                };
                if(transaction.executed)
                    transactions.push(transaction);
                else
                    pendingTransactions.push(transaction);
            }
            let balance = await provider.getBalance(walletsAddresses[i]);
            let wallet = {
                address: walletsAddresses[i],
                name: name,
                balance: balance,
                approvalsRequired: approvalsRequired,
                transactions: transactions,
                pendingTransactions: pendingTransactions
            };
            wallets.push(wallet);
        }
        
        setMyWallets(wallets);
        if(wallets.length > 0 && !activeWalletIndex) 
            setActiveWalletIndex(0);
    }

    const sendFunds = async () => {
        let data = {
            to: myWallets[activeWalletIndex].address,
            value: toWei(amountToSend)
        };
        try {
            const tx = await signer.sendTransaction(data);
            await tx.wait();
            toast.success("Wallet funded");
            setAmountToSend("");
            await setWallets();
        }
        catch(e) {
            toast.error("An error ocurred");
            console.log(e);
        }
    }

    const proposeTransaction = async () => {
        if(newTransactionDestination.length != 42 || newTransactionDestination.substr(0, 2) != '0x') {
            toast.error("Invalid wallet address");
            return;
        }
        let multisigWalletAddress = myWallets[activeWalletIndex].address;
        try {
            let multisigContract = new ethers.Contract(multisigWalletAddress, multisigWalletAbi, signer);
            let tx = await multisigContract.proposeTransaction(newTransactionDestination, toWei(newTransactionValue));
            await tx.wait();
            toast.success("Transaction proposed");
            setNewTransactionDestination("");
            setNewTransactionValue("");
            setShowModal(false);
            await setWallets();
        }
        catch(e) {
            toast.error("An error ocurred");
            console.log(e);
        }
    }
    
    const approveTransaction = async (transactionId) => {
        let multisigWalletAddress = myWallets[activeWalletIndex].address;
        try {
            let multisigContract = new ethers.Contract(multisigWalletAddress, multisigWalletAbi, signer);
            let tx = await multisigContract.approveTransaction(transactionId);
            await tx.wait();
            toast.success("Transaction approved");
            await setWallets();
        }
        catch(e) {
            toast.error("An error ocurred");
            console.log(e);
        }
    }

    const executeTransaction = async (transactionId) => {
        let multisigWalletAddress = myWallets[activeWalletIndex].address;
        try {
            let multisigContract = new ethers.Contract(multisigWalletAddress, multisigWalletAbi, signer);
            let tx = await multisigContract.executeTransaction(transactionId);
            await tx.wait();
            toast.success("Transaction executed");
            setWallets();
        }
        catch(e) {
            toast.error("An error ocurred");
            console.log(e);
        }
    }

    const validateAndSetAmountToSend = (value) => {
        let pattern = /^[0-9]+(\.)?[0-9]*$/;
        if(value != "" && !pattern.test(value))
            return;
        setAmountToSend(value);
    }

    const validateAndSetNewTransactionValue = (value) => {
        let pattern = /^[0-9]+(\.)?[0-9]*$/;
        if(value != "" && !pattern.test(value))
            return;
        setNewTransactionValue(value);
    }

    return multisigFactory ? (
        <div>
            <div className="wallets-list">
                <h3 className="font-bold text-2xl m-2">My Vaults</h3>
                {
                    myWallets.map((myWallet, i) => (
                        <div key={myWallet.address} 
                            className={"cursor-pointer inline-block mx-2 hover:border-4 transition-all custom-background-color2 px-12 py-8 max-w-md mb-6 custom-border-color rounded-xl " + (activeWalletIndex == i ? 'border-4' : 'border')}
                            onClick={ () => setActiveWalletIndex(i) }
                        >
                            <div className="font-bold mb-2">{ myWallet.name }</div>
                            <div>{ formatBalance(myWallet.balance) } ETH</div>
                            <div>{ myWallet.pendingTransactions.length } pending transactions</div>
                        </div>
                    ))
                }
            </div>
            {
                activeWalletIndex >= 0 && (
                    <div className="selected-wallet">
                        <h3 className="font-bold text-2xl m-2">Details</h3>
                        <div className="wallet-details mx-2 custom-background-color2 custom-border-color border rounded-xl py-8 px-12">
                            <h2 className="font-bold text-2xl mb-6">{ myWallets[activeWalletIndex].name }</h2>
                            <div className="vault-address-container mb-4">
                                <label className="font-bold">Vault address</label>
                                <label className="w-full block">{ myWallets[activeWalletIndex].address }</label>
                            </div>
                            <div className="balance-container mb-4">
                                <label className="font-bold">Current balance</label>
                                <label className="w-full block">{ formatBalance(myWallets[activeWalletIndex].balance) } ETH</label>
                            </div>
                            <div className="pending-transactions mb-6 mt-6 pt-2">
                                <label className="font-bold text-lg">Pending transactions</label>
                                <table className="table-auto w-full mt-1">
                                    <thead>
                                        <tr>
                                            <th className='text-left'>Destination</th>
                                            <th className='text-left'>Amount</th>
                                            <th className='text-left'>Approvals</th>
                                            <th className='text-left'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    { 
                                        myWallets[activeWalletIndex].pendingTransactions.length > 0 ? 
                                            myWallets[activeWalletIndex].pendingTransactions.map((transaction, i) => (
                                                <tr className={"" + (i % 2 == 0 ? 'custom-background-color1' : 'custom-background-color')} key={transaction.id}>
                                                    <td className="py-2 pl-2">{transaction.to}</td>
                                                    <td>{formatBalance(transaction.value)} ETH</td>
                                                    <td>{ transaction.approvals + '/' + myWallets[activeWalletIndex].approvalsRequired }</td>
                                                    <td>
                                                        {
                                                            transaction.approvals >= myWallets[activeWalletIndex].approvalsRequired ?
                                                                <button 
                                                                    className="border px-4 pb-1 rounded-full custom-background-color3 custom-border-color transition-all" 
                                                                    onClick={()=>executeTransaction(transaction.id)}
                                                                >
                                                                    Execute
                                                                </button>
                                                            : transaction.approved ?
                                                                "Approved"
                                                            :
                                                                <button 
                                                                    className="border px-4 pb-1 rounded-full custom-background-color3 custom-border-color transition-all" 
                                                                    onClick={()=>approveTransaction(transaction.id)}
                                                                >
                                                                    Approve
                                                                </button>
                                                        }
                                                    </td>
                                                </tr>
                                            )) 
                                        :
                                            <tr className="custom-background-color1"><td className="text-center py-2" colSpan="4">No pending transactions</td></tr>
                                    }
                                    </tbody>
                                </table>
                            </div>
                            <div className="last-transactions mb-6 pt-2">
                                <label className="font-bold text-lg">Last transactions</label>
                                <table className="table-auto w-full mt-1">
                                    <thead>
                                        <tr>
                                            <th className='text-left'>Destination</th>
                                            <th className='text-left'>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    { 
                                        myWallets[activeWalletIndex].transactions.length > 0 ? 
                                            myWallets[activeWalletIndex].transactions.map((transaction, i) => (
                                                <tr className={"" + (i % 2 == 0 ? 'custom-background-color1' : 'custom-background-color')} key={transaction.id}>
                                                    <td className="py-2 pl-2">{transaction.to}</td>
                                                    <td>{formatBalance(transaction.value)} ETH</td>
                                                </tr>
                                            )) 
                                        :
                                            <tr className="custom-background-color1"><td className="text-center py-2" colSpan="4">No transactions</td></tr>
                                    }
                                    </tbody>
                                </table>
                            </div>
                            <button className="border px-4 py-2 rounded-full custom-background-color3 custom-border-color transition-all" onClick={() => setShowModal(true) }>Propose transaction</button>
                            <div className="send-funds-container mt-10 text-center w-full">
                                <input 
                                    type="text" 
                                    value={amountToSend} 
                                    onChange={ (e) => validateAndSetAmountToSend(e.target.value) } 
                                    className="rounded px-3 py-2 text-right w-24 mx-2 focus:outline-none font-bold text-gray-500 custom-background-color3 mb-2">
                                </input>
                                <button className="border px-4 py-2 rounded-full custom-background-color3 custom-border-color transition-all" onClick={() => sendFunds() }>Send funds</button>
                            </div>
                        </div>
                    </div>
                )
            }
            { /* Modal for proposing a new transaction */ }
            { showModal &&
                (
                <div className="modal fixed top-0 left-0 min-h-screen w-full">
                    <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                        <div className="modal-overlay z-10 fixed top-0 left-0 w-full h-full" onClick={ () => { setShowModal(false) }}></div>
                        <div className="modal-content px-10 pt-8 pb-10 max-w-lg w-full shadow-lg custom-background-color2 z-20 border rounded-xl custom-border-color">
                            <h5 className="text-center mt-0 mb-8 font-bold text-xl">Propose transaction</h5>
                            <label className="font-bold">Transaction destination</label>
                            <input 
                                type="text" 
                                value={newTransactionDestination} 
                                onChange={ (e) => setNewTransactionDestination(e.target.value) } 
                                className="rounded w-full p-3 focus:outline-none font-bold text-gray-500 custom-background-color3 mb-2">
                            </input>
                            <label className="font-bold">Transaction value</label>
                            <input 
                                type="text" 
                                value={newTransactionValue} 
                                onChange={ (e) => validateAndSetNewTransactionValue(e.target.value) } 
                                className="rounded w-full p-3 focus:outline-none font-bold text-gray-500 custom-background-color3 mb-2">
                            </input>
                            <button className="border px-4 py-2 mt-2 rounded-full custom-background-color3 custom-border-color transition-all" onClick={() => proposeTransaction() }>Propose transaction</button>
                        </div>
                    </div>
                </div>
                )
            }
        </div>
    ) : (<div className="text-center text-2xl pt-40">Please connect your metamask</div>);
}

export default MyVaultsPage;