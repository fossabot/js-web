import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import cookies from '../../src/utils/cookies';
import API_PATHS from '../../src/constants/apiPaths';

const url = process.env.AUTH_API_BASE_URL;

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse & { cookie: any },
) => {
  try {
    const { token, password, recaptcha } = req.body;
    const response = await axios.post(`${url}${API_PATHS.SETUP_ACCOUNT}`, {
      token,
      password,
      recaptcha,
    });

    const {
      data: {
        accessToken,
        refreshToken,
        accessTokenExpiry,
        refreshTokenExpiry,
        user,
      },
    } = response.data;

    res.cookie('refresh_token', refreshToken, {
      maxAge: refreshTokenExpiry * 1000, // convert from seconds to milliseconds
      httpOnly: true,
      path: '/',
      secure: false,
    });

    return res.status(200).json({
      accessToken,
      refreshToken,
      accessTokenExpiry,
      user,
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
