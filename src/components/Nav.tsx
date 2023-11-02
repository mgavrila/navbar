import { BrowserRouter, Link } from 'react-router-dom';
import { routes } from '../routes';
import { ExtensionLoginButton } from './sdkDappComponents';
import { useGetIsLoggedIn, useTrackTransactionStatus } from '../hooks';
import { logout, sendTransactions } from '../helpers/sdkDappHelpers';
import { useEffect, useState } from 'react';

export const Nav = ({ eventEmitter }) => {
  const isLoggedIn = useGetIsLoggedIn();
  const [sessionIds, setSessionIds] = useState([]);

  const { transactions, isSuccessful } = useTrackTransactionStatus({
    transactionId: sessionIds[0]
  });

  useEffect(() => {
    eventEmitter.listenTransaction(async (data) => {
      const { sessionId } = await sendTransactions({
        transactions: data,
        signWithoutSending: false,
        callbackRoute: window.location.pathname,
        customTransactionInformation: { redirectAfterSign: true }
      });

      setSessionIds((prevState) => [...prevState, sessionId]);
    });
  }, []);

  useEffect(() => {
    if (isSuccessful) {
      eventEmitter.emitTransactionResult({ transactions });
    }
  }, [isSuccessful]);

  const handleLogout = () => {
    sessionStorage.clear();
    logout(`${window.location.origin}/unlock`, undefined, false);
  };

  return (
    <BrowserRouter>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', gap: '1rem' }}>
          {routes.map((route) => (
            <Link key={route.name} to={route.href}>
              {route.name}
            </Link>
          ))}
        </div>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className='inline-block rounded-lg px-3 py-2 text-center hover:no-underline my-0 text-gray-600 hover:bg-slate-100 mx-0'
          >
            Close
          </button>
        ) : (
          <ExtensionLoginButton
            loginButtonText='DeFi Wallet'
            callbackRoute='/'
            nativeAuth
          />
        )}
      </div>
    </BrowserRouter>
  );
};
