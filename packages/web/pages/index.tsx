import { useEffect } from 'react';
import { useRouter } from 'next/router';

import withAuth from '../src/app-state/auth';
import WEB_PATHS from '../src/constants/webPaths';

function Home() {
  const router = useRouter();

  useEffect(() => {
    if (router) {
      router.replace(WEB_PATHS.DASHBOARD);
    }
  }, [router]);

  return null;
}

export default withAuth(Home);
