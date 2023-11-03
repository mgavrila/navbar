import {
  Nav,
  DappProvider,
  AxiosInterceptorContext,
  TransactionsToastList,
  NotificationModal,
  SignTransactionsModals
} from './components';
import { BrowserRouter } from 'react-router-dom';

export default function Root(props) {
  return (
    <AxiosInterceptorContext.Provider>
      <AxiosInterceptorContext.Interceptor authenticatedDomanis={[]}>
        <DappProvider
          environment={'testnet'}
          customNetworkConfig={{
            name: 'customConfig',
            apiTimeout: 6000,
            walletConnectV2ProjectId: '9b1a9564f91cb659ffe21b73d5c4e2d8',
            walletConnectV2RelayAddresses: [
              'wss://eu-central-1.relay.walletconnect.com'
            ]
          }}
          dappConfig={{
            shouldUseWebViewProvider: true,
            logoutRoute: '/'
          }}
          customComponents={{
            transactionTracker: {
              // uncomment this to use the custom transaction tracker
              // component: TransactionsTracker,
              props: {
                onSuccess: (sessionId: string) => {
                  console.log(`Session ${sessionId} successfully completed`);
                },
                onFail: (sessionId: string, errorMessage: string) => {
                  console.log(
                    `Session ${sessionId} failed. ${errorMessage ?? ''}`
                  );
                }
              }
            }
          }}
        >
          <AxiosInterceptorContext.Listener>
            <TransactionsToastList />
            <NotificationModal />
            <SignTransactionsModals />
            <BrowserRouter>
              <Nav {...props} />
            </BrowserRouter>
          </AxiosInterceptorContext.Listener>
        </DappProvider>
      </AxiosInterceptorContext.Interceptor>
    </AxiosInterceptorContext.Provider>
  );
}
