import { useEffect, useState } from 'react';
import { useExtensionLogin, useWebWalletLogin } from './sdkDapphooks';
import { useNavigate } from 'react-router-dom';

export const useLogin = (loginData) => {
  const { callbackRoute, token, nativeAuth } = loginData ?? {};
  const [isXPortal, setIsXPortal] = useState(false);
  const [isLedger, setIsLedger] = useState(false);
  const navigate = useNavigate();
  const [extensionLogin] = useExtensionLogin({
    callbackRoute,
    token,
    onLoginRedirect: () => {
      navigate(callbackRoute);
    },
    nativeAuth
  });

  const [webLogin] = useWebWalletLogin({
    callbackRoute,
    token,
    nativeAuth
  });

  useEffect(() => {
    if (!loginData) {
      return;
    }

    switch (loginData.provider) {
      case 'extension':
        extensionLogin();
        break;
      case 'web':
        webLogin();
        break;
      case 'xPortal':
        setIsXPortal(true);
        break;
      case 'ledger':
        setIsLedger(true);
        break;
      default:
        break;
    }
  }, [loginData]);

  return { isXPortal, isLedger, callbackRoute, setIsXPortal, setIsLedger };
};
