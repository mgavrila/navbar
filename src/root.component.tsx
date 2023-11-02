import {
  Nav,
  DappProvider,
  AxiosInterceptorContext,
  TransactionsToastList,
  NotificationModal,
  SignTransactionsModals
} from './components';

export default function Root(props) {
  return (
    <AxiosInterceptorContext.Provider>
      <AxiosInterceptorContext.Interceptor authenticatedDomanis={[]}>
        <DappProvider
          environment={'devnet'}
          customNetworkConfig={{
            name: 'customConfig',
            apiTimeout: 6000,
            walletConnectV2ProjectId: '9b1a9564f91cb659ffe21b73d5c4e2d8'
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
            <section>
              <Nav {...props} />
            </section>
          </AxiosInterceptorContext.Listener>
        </DappProvider>
      </AxiosInterceptorContext.Interceptor>
    </AxiosInterceptorContext.Provider>
  );
}
