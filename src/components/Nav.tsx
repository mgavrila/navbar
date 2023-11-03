import { Link } from 'react-router-dom';
import { routes } from '../routes';
import {
  WalletConnectLoginContainer,
  LedgerLoginContainer
} from './sdkDappComponents';
import { useGetIsLoggedIn, useTrackTransactionStatus } from '../hooks';
import { logout, sendTransactions } from '../helpers/sdkDappHelpers';
import { useEffect, useState } from 'react';
import MvxLogo from './MvxIcon';
import { useLogin } from '../hooks';

export const Nav = ({ eventEmitter }) => {
  const isLoggedIn = useGetIsLoggedIn();
  const [sessionId, setSessionId] = useState(null);
  const [eventName, setEventName] = useState(null);
  const [loginData, setLoginData] = useState(null);
  const { isXPortal, isLedger, setIsLedger, setIsXPortal } =
    useLogin(loginData);

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
      if (payload.type === 'login') {
        setLoginData({ ...payload.data });
      }

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
    <div className='flex justify-between gap-1 px-20 py-4'>
      <div className='flex gap-8 items-center'>
        <Link to='/'>
          <MvxLogo width='120' height='100%' />
        </Link>

        {isLoggedIn && (
          <div className='flex gap-4 text-gray-600'>
            {routes.map((route) => (
              <Link key={route.name} to={route.href}>
                {route.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className='inline-block rounded-lg px-3 py-2 text-center hover:no-underline my-0 text-gray-600 hover:bg-gray-200 mx-0'
        >
          Close
        </button>
      ) : (
        <Link
          to='/unlock'
          className='inline-block rounded-lg px-3 py-2 text-center hover:no-underline my-0 bg-blue-600 text-white hover:bg-blue-700 ml-2 mr-0'
        >
          Connect
        </Link>
      )}

      {isXPortal && (
        <WalletConnectLoginContainer
          loginButtonText='xPortal'
          onClose={() => setIsXPortal(false)}
          callbackRoute='/dapp1'
          nativeAuth
          showLoginModal
          showLoginContent
          wrapContentInsideModal
        />
      )}

      {isLedger && (
        <LedgerLoginContainer
          showLoginContent
          showLoginModal
          callbackRoute={'/dapp1'}
          wrapContentInsideModal
          showScamPhishingAlert={true}
          onClose={() => setIsLedger(false)}
          nativeAuth
        />
      )}
    </div>
  );
};
