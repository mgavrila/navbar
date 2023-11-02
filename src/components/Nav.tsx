import { BrowserRouter, Link } from 'react-router-dom';
import { routes } from '../routes';
import { ExtensionLoginButton } from './sdkDappComponents';
import { useGetIsLoggedIn, useTrackTransactionStatus } from '../hooks';
import { logout, sendTransactions } from '../helpers/sdkDappHelpers';
import { useEffect, useState } from 'react';

export const Nav = ({ eventEmitter }) => {
  const isLoggedIn = useGetIsLoggedIn();
  const [sessionId, setSessionId] = useState(null);
  const [eventName, setEventName] = useState(null);

  const { transactions } = useTrackTransactionStatus({
    transactionId: sessionId,
    onSuccess: () => {
      eventEmitter.emitToEvent(eventName, {
        type: 'result',
        data: transactions
      });
    }
  });

  useEffect(() => {
    eventEmitter.listenToAll(async (payload) => {
      if (payload.type === 'transaction') {
        const { sessionId } = await sendTransactions({
          transactions: payload.data,
          signWithoutSending: false,
          callbackRoute: window.location.pathname,
          customTransactionInformation: { redirectAfterSign: true }
        });

        setEventName(payload.eventName);
        setSessionId(sessionId);
      }
    });
  }, []);

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
