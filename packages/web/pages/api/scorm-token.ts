import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import cookies from '../../src/utils/cookies';
import API_PATHS from '../../src/constants/apiPaths';
import { HTTP_AUTH_HEADER, HTTP_STATUS } from '../../src/constants/http';

const url = process.env.CENTRAL_API_BASE_URL;
const authURL = process.env.AUTH_API_BASE_URL;

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse & { cookie: any },
) => {
  const refresh_token = req.cookies['refresh_token'] || '';

  // NestedIframe request (Will redirect to bypass)
  if (!req.headers.referer?.includes(req.headers.host)) {
    const paths = req.query.path as string[];

    res.writeHead(302, {
      location: `${req.query.location}_bypass/${paths.join('/')}`,
    });

    return res.end();
  }

  try {
    const { data } = await axios.get(`${authURL}${API_PATHS.REFRESH_TOKEN}`, {
      headers: {
        refresh_token,
        'Cache-Control': 'no-cache',
      },
    });

    const { accessToken } = data;

    const response = await axios.get(`${url}/${API_PATHS.SCORM_ACCESS_TOKEN}`, {
      headers: {
        [HTTP_AUTH_HEADER]: accessToken,
      },
    });

    const { scormToken, scormTokenExpiry } = response.data;

    res.cookie('scorm_token', scormToken, {
      maxAge: (scormTokenExpiry - 5) * 1000, // convert from seconds to milliseconds [Make cookie expires before it Jwt]
      httpOnly: true,
      path: '/',
      secure: false,
    });

    res.setHeader('scorm_token', scormToken);

    if (req.query.location) {
      const paths = req.query.path as string[];

      res.writeHead(302, {
        location: `${req.query.location}/${paths.join('/')}`,
      });

      return res.end();
    }

    return res.status(200).json({
      scormToken,
      scormTokenExpiry,
    });
  } catch (error) {
    if (error.response && error.response.status) {
      if (error.response.status === HTTP_STATUS.UNAUTHORIZED) {
        res.cookie('scorm_token', '', {
          httpOnly: true,
          path: '/',
          expires: new Date(0),
        });
      }
      return res.status(error.response.status).json({
        message: error.response.statusText,
        ...error.response.data,
      });
    }
    return res.status(500).json({
      message: 'Unexpected Server Error',
    });
  }
};

export default cookies(handler);
