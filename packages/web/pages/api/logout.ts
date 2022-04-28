import axios from 'axios';
import { NextApiRequest } from 'next';

import cookies from '../../src/utils/cookies';
import API_PATHS from '../../src/constants/apiPaths';

const url = process.env.AUTH_API_BASE_URL;

const handler = async (req: NextApiRequest, res) => {
  try {
    const refresh_token = req.cookies['refresh_token'] || '';

    await axios.post(
      `${url}${API_PATHS.LOGOUT}`,
      {},
      {
        headers: {
          refresh_token,
          ...req.headers,
        },
      },
    );
    res.cookie('refresh_token', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0),
    });
    res.status(200).json({
      success: 'ok',
    });
  } catch (error) {
    if (error.response && error.response.status) {
      return res.status(error.response.status).json({
        data: error.response.data,
        message: error.response.statusText,
      });
    }
    return res.status(500).json({
      message: 'Unexpected Server Error',
    });
  }
};

export default cookies(handler);
