import { useState } from 'react';
import { toast } from 'react-toastify';

function NewVaultPage({multisigFactory}) {
    const[walletName, setWalletName] = useState();
    const[wallets, setWallets] = useState(["", "", ""]);
    const[approvalsRequired, setApprovalsRequired] = useState();

    const create = async () => {
        if(!validateForm())
            return;
        
        try {
            let tx = await multisigFactory.createMultisigWallet(walletName, wallets, approvalsRequired);
            await tx.wait();
            toast.success("MultiSig wallet (vault) created");
            resetInputs();
        }
        catch(e) {
            toast.error("An error ocurred");
            console.log(e);
        }
    }

    const validateForm = () => {
        if(walletName.length == 0) {
            toast.error("Invalid vault name");
            return false;
        }

        let noEmptyWallets = [];
        for(let i = 0; i < wallets.length; i++) {
            if(wallets[i].length == 0)
                continue;
            if(wallets[i].length != 42 || wallets[i].substr(0, 2) != '0x') {
                toast.error("Invalid wallet address");
                return;
            }
            noEmptyWallets.push(wallets[i]);
        }

        if(noEmptyWallets.length < 3) {
            toast.error("You need at least 3 wallets");
            return;
        }
        
        if(approvalsRequired <= noEmptyWallets.length / 2 || approvalsRequired > noEmptyWallets.length) {
            toast.error("The required approvals should be more than 50% of the number of wallets");
            return;
        }

        setWallets(noEmptyWallets);
        return true;
    }
    
    const setWallet = (value, index) => {
        let newWallets = [...wallets];
        newWallets[index] = value;
        setWallets(newWallets);
    }

    const addWallet = () => {
        let newWallets = [...wallets];
        newWallets[wallets.length] = "";
        setWallets(newWallets);
    }
    
    const validateAndSetApprovalsRequired = (value) => {
        let pattern = /^[0-9]*$/;
        if(value != "" && !pattern.test(value))
            return;
        setApprovalsRequired(value);
    }

    const resetInputs = () => {
        setWalletName("");
        setWallets(["", "", ""]);
        setApprovalsRequired("");
    }

    return multisigFactory ? (
        <div>
            <h3 className="font-bold text-2xl m-2">Create new vault</h3>
            <div className="mx-2 custom-background-color2 custom-border-color border rounded-xl py-12 px-20">
                <label className="font-bold">Vault name</label>
                <input 
                    type="text" 
                    value={walletName} 
                    onChange={ (e) => setWalletName(e.target.value) } 
                    className="rounded w-full p-3 focus:outline-none font-bold text-gray-500 custom-background-color3 mb-6">
                </input>
                {
                    wallets.map((w, index) => (
                        <div className="form-group">
                            <label className="font-bold">{"Address " + (index + 1)}</label>
                            <input 
                                type="text" 
                                value={w} 
                                onChange={ (e) => setWallet(e.target.value, index) } 
                                className="rounded w-full p-3 focus:outline-none font-bold text-gray-500 custom-background-color3 mb-2">
                            </input>
                        </div>
                    ))
                }
                <div className="w-full mb-6">
                    <button className="border px-8 py-2 rounded-full custom-border-color custom-background-color3 transition-all" onClick={() => addWallet()}>Add wallet</button>
                </div>
                <label className="font-bold">Number of approvals required</label>
                <input 
                    type="text" 
                    value={approvalsRequired} 
                    onChange={ (e) => validateAndSetApprovalsRequired(e.target.value) } 
                    className="rounded w-full p-3 focus:outline-none font-bold text-gray-500 custom-background-color3 mb-2">
                </input>
                <button className="border mt-2 px-8 py-2 rounded-full custom-border-color custom-background-color3 transition-all" onClick={() => create()}>Create</button>
            </div>
        </div>
    ) : (<div className="text-center text-2xl pt-40">Please connect your metamask</div>);
}

export default NewVaultPage;