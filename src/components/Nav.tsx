import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { routes } from '../routes';
import {
  WalletConnectLoginContainer,
  LedgerLoginContainer
} from './sdkDappComponents';
import {
  useGetAccountInfo,
  useGetIsLoggedIn,
  useGetLoginInfo,
  useTrackTransactionStatus
} from '../hooks';
import { logout, sendTransactions } from '../helpers/sdkDappHelpers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import MvxLogo from './MvxIcon';
import { useLogin } from '../hooks';
import { getSearchParamAddress } from '@multiversx/sdk-dapp/utils/account/getSearchParamAddress';
import { isWindowAvailable } from '@multiversx/sdk-dapp/utils/isWindowAvailable';
import { matchRoute } from '@multiversx/sdk-dapp/wrappers/AuthenticatedRoutesWrapper/helpers/matchRoute';
import { useExecuteOnce } from '../hooks/useExecuteOnce';

const getLocationPathname = () => {
  if (isWindowAvailable()) {
    return window.location.pathname;
  }
  return '';
};

const pathname = getLocationPathname();

export const Nav = ({ eventEmitter }) => {
  const isLoggedIn = useGetIsLoggedIn();
  const navigate = useNavigate();
  const [searchParams, getSeachParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(null);
  const [eventName, setEventName] = useState(null);
  const [loginData, setLoginData] = useState(null);

  const { isXPortal, isLedger, callbackRoute, setIsLedger, setIsXPortal } =
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

  const searchParamAddress = getSearchParamAddress();
  const { isAccountLoading } = useGetAccountInfo();
  const { walletLogin, loginMethod } = useGetLoginInfo();

  const isOnAuthenticatedRoute = matchRoute(routes, getLocationPathname());

  const isValidWalletLoginAttempt = walletLogin != null && searchParamAddress;

  const isAuthenticated = useMemo(() => {
    return isLoggedIn && Boolean(loginMethod);
  }, [isLoggedIn, loginMethod]);

  const shouldRedirect =
    isOnAuthenticatedRoute &&
    !isAuthenticated &&
    walletLogin == null &&
    !isAccountLoading;

  const executeOnce = useExecuteOnce();

  const redirect = useCallback(() => {
    if (isLoggedIn) {
      return;
    }
    const uri = callbackRoute ? `?callbackRoute=${callbackRoute}` : '';

    const addressUrl = searchParams.get('address');

    if (!addressUrl) {
      navigate(`/unlock${uri}`);
    }
  }, [navigate, isLoggedIn]);

  useEffect(() => {
    const paramCallback = searchParams.get('callbackRoute');
    if (isLoggedIn && getLocationPathname() === '/unlock' && paramCallback) {
      navigate(paramCallback);
    }
  }, [searchParams, isLoggedIn]);

  useEffect(() => {
    redirect();
  }, [redirect]);

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

        setSessionId(sessionId);
      }

      setEventName(payload.eventName);
    });
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    logout(`${window.location.origin}/unlock`, undefined, false);
  };

  if (isAccountLoading && isValidWalletLoginAttempt) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex justify-between gap-1 px-20 py-4'>
      <div className='flex gap-8 items-center'>
        <Link to='/'>
          <MvxLogo width='120' height='100%' />
        </Link>

        {isLoggedIn && (
          <div className='flex gap-4 text-gray-600'>
            {routes.map((route) => (
              <Link key={route.name} to={route.path}>
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
          onLoginRedirect={() => {
            setIsXPortal(false);
            navigate('/dapp1');
          }}
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
          onLoginRedirect={() => {
            setIsLedger(false);
            navigate('/dapp1');
          }}
        />
      )}
    </div>
  );
};
