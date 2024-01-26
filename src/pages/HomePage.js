function HomePage({isConnected, connectWallet}) {
    return (
        <div className="max-w-4xl mx-auto pt-20 text-center text-white">
            <div className="text-4xl py-2">
                Empower Your Transactions with Multi-Signature Wallets
            </div>
            <div className="text-2xl my-2">
                Secure, Transparent, and Decentralized Control Over Your Assets
            </div>
            <div className="text-xl font-bold mt-20">
                Create Your Multi-Signature Wallet Now and protect your funds
            </div>
            { 
                !isConnected && (
                    <div>
                        <button className="border px-4 py-2 mt-6 rounded-full custom-background-color3 custom-border-color transition-all" onClick={connectWallet}>Connect your wallet</button>
                    </div>
                ) 
            }
        </div>
    );
}

export default HomePage;