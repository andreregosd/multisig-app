import logo from './res/logo.png';
import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { multisigFactoryAddress, multisigFactoryAbi } from './constants/constants';
import HomePage from './pages/HomePage';
import MyVaultsPage from './pages/MyVaultsPage';
import NewVaultPage from './pages/NewVaultPage';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState();
  const [multisigFactory, setMultisigFactory] = useState();

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setSigner(signer);
        setIsConnected(true);
        const contract = await new ethers.Contract(multisigFactoryAddress, multisigFactoryAbi, signer);
        setMultisigFactory(contract);
      }
      catch(e){
        toast.error("An error ocurred");
        console.log(e);
        return;
      }
      
      toast.success('Connected');
    } 
    else {
      console.log("Please Install Metamask!!!");
    }
  }

  return (
    <div className="App min-h-screen custom-background-color custom-color relative">
      <BrowserRouter>
        <ToastContainer position="bottom-center" limit={1} />
        <header className="App-header flex flex-wrap items-center justify-between max-w-screen-xl mx-auto pt-4">
          <Link className="logo text-decoration-none" to='/'>
            <img src={logo} className="App-logo h-14" alt="logo" />
          </Link>
          {
            isConnected ? (
              <div className="header-menu-container inline-flex">
                <Link className="mx-4 flex items-center font-bold" to='/my-vaults'>My Vaults</Link>
                <Link className="mx-4 flex items-center font-bold" to='/new-vault'>New Vault</Link>
                <button className="ml-6 border px-4 py-2 rounded-full custom-background-color3 custom-border-color transition-all">{ signer.address.slice(0, 6) + '...' + signer.address.slice(-4) }</button>
              </div>
            ) : (
              <div className="header-menu-container inline-flex">
                <button className="border px-4 py-2 rounded-full custom-background-color3 custom-border-color transition-all" onClick={() => connectWallet()}>Connect</button>
              </div>
            )
          }
        </header>
        <div className="max-w-screen-lg mx-auto pt-10 pb-20">
          <Routes>
            <Route path="/" element={<HomePage isConnected={isConnected} connectWallet={connectWallet} />} />
            <Route path="/my-vaults" element={<MyVaultsPage multisigFactory={multisigFactory} signer={signer} />} />
            <Route path="/new-vault" element={<NewVaultPage multisigFactory={multisigFactory} />} />
          </Routes>
        </div>
        <footer className="pt-10 pb-2 w-full text-center mt-10 absolute bottom-0">Developed by andrerego</footer>
      </BrowserRouter>
    </div>
  );
}

export default App;
