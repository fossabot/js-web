import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import cookies from '../../src/utils/cookies';
import API_PATHS from '../../src/constants/apiPaths';
import { HTTP_STATUS } from '../../src/constants/http';

const url = process.env.AUTH_API_BASE_URL;

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse & { cookie: any },
) => {
  try {
    const refresh_token = req.cookies['refresh_token'] || '';

    const response = await axios.get(`${url}${API_PATHS.REFRESH_TOKEN}`, {
      headers: {
        refresh_token,
        'Cache-Control': 'no-cache',
      },
    });

    const { accessToken, accessTokenExpiry, user } = response.data;

    return res.status(200).json({
      accessToken,
      accessTokenExpiry,
      user,
    });
  } catch (error) {
    if (error.response && error.response.status) {
      if (error.response.status === HTTP_STATUS.UNAUTHORIZED) {
        res.cookie('refresh_token', '', {
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
