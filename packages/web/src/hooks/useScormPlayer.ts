import axios from 'axios';
import { useEffect, useState } from 'react';
import { IAuthContext } from '../app-state/authContext';
import courseApi from '../http/course.api';
import { IScormLearner } from '../models/scorm';
import {
  scormAPI,
  IScormAPI,
  ScormVersion,
  getScormVersionFromXML,
} from '../utils/scormAPI';

interface IUseScormPlayer {
  (
    token: IAuthContext['token'],
    onSetValue?: (element: string, val: any) => void,
  ): {
    scormVersion: ScormVersion;
    scormAPI: IScormAPI;
    isScormReady: boolean;
    launchUrl: string;
    initSCORM: (contentId: string) => Promise<void>;
  };
}

export const useScormPlayer: IUseScormPlayer = (token, onSetValue) => {
  const [launchUrl, setLaunchUrl] = useState(undefined);
  const [isScormReady, setIsScormReady] = useState(false);
  const [scormVersion, setScormVersion] = useState(undefined);
  const [learner, setLearner] = useState<IScormLearner>({
    metadata: {},
    id: '',
    name: '',
    email: '',
    location: '',
    status: '',
    entry: 'resume',
    exit: 'suspend',
    suspend_data: '0',
  });

  useEffect(() => {
    if (launchUrl && learner.id !== '' && scormVersion) setIsScormReady(true);
  }, [launchUrl, learner.id, scormVersion]);

  const initSCORM = async (learningContentId: string) => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : '';

    const { data } = await courseApi.getLearningContent(learningContentId);
    const result = await axios.get(`${origin}/scorm_files/${data.key}`);
    const xmlDoc = new DOMParser().parseFromString(result.data, 'text/xml');
    setScormVersion(getScormVersionFromXML(xmlDoc));

    const learner = await courseApi.getScormProgress(learningContentId);
    setLearner({
      metadata: learner.metadata,
      id: token.user.id,
      name: token.user.firstName ?? '',
      email: token.user.email,
      location: learner.location,
      status: learner.status,
      entry: 'resume',
      exit: 'suspend',
      suspend_data: learner.suspend_data,
    });

    const courseName = data.key.split('/')[0];
    const launchFile = xmlDoc
      .getElementsByTagName('resource')[0]
      .getAttribute('href');
    setLaunchUrl(`${origin}/scorm_files/${courseName}/${launchFile}`);
  };

  return {
    launchUrl,
    scormVersion,
    isScormReady,
    initSCORM,
    scormAPI: isScormReady && scormAPI(scormVersion, learner, onSetValue),
  };
};
