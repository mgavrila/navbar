import { useEffect, useState } from 'react';
import { useExtensionLogin, useWebWalletLogin } from './sdkDapphooks';

export const useLogin = (loginData) => {
  const { callbackRoute, token, onLoginRedirect, nativeAuth } = loginData ?? {};
  const [isXPortal, setIsXPortal] = useState(false);
  const [isLedger, setIsLedger] = useState(false);
  const [extensionLogin] = useExtensionLogin({
    callbackRoute,
    token,
    onLoginRedirect,
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

  return { isXPortal, isLedger, setIsXPortal, setIsLedger };
};
