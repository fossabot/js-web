import { useFormik } from 'formik';
import { merge, uniqBy } from 'lodash';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import useMultiAsyncInput from '../../hooks/useMultiAsyncInput';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { CatalogMenu } from '../../models/catalog-menu';
import Button from '../../ui-kit/Button';
import ConfirmationModal from '../../ui-kit/ConfirmationModal';
import ErrorMessages from '../../ui-kit/ErrorMessage';
import InputSection from '../../ui-kit/InputSection';
import InputSelect from '../../ui-kit/InputSelect';
import { useModal } from '../../ui-kit/Modal';
import SuccessMessage from '../../ui-kit/SuccessMessage';
import { swapElement } from '../../utils/array';
import { getErrorMessages } from '../../utils/error';
import { captureError } from '../../utils/error-routing';
import { menuSchema, topicSchema } from './menu.schema';
import MenuItems from './MenuItems';

const ManageCatalogMenuPage = () => {
  const { t } = useTranslation();
  const [menuTopics, setMenuTopics] = useState([]);
  const [menuLearningWays, setMenuLearningWays] = useState([]);
  const [errors, setErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const confirmSaveModalProps = useModal();

  const menuFormik = useFormik({
    initialValues: {
      topicHeadlineEn: '',
      topicHeadlineTh: '',
      learningWayHeadlineEn: '',
      learningWayHeadlineTh: '',
    },
    validationSchema: menuSchema,
    onSubmit: handleMenuSubmit,
  });

  const topicFormik = useFormik({
    initialValues: {
      topicIds: [],
    },
    validationSchema: topicSchema,
    onSubmit: handleSubmitTopics,
  });

  const {
    options: topicOptions,
    getOptions: getTopicOptions,
    inputValues: topicInputValues,
    onValueChange: onTopicsValueChange,
  } = useMultiAsyncInput({
    http: centralHttp.get,
    apiPath: API_PATHS.TOPICS,
    formikFieldValue: topicFormik.values.topicIds,
  });

  function handleSubmitTopics(values) {
    const items = topicOptions.filter((it) => values.topicIds.includes(it.id));
    const newArr = uniqBy([...menuTopics, ...items], 'id');
    topicFormik.setValues({
      topicIds: [],
    });
    setMenuTopics(newArr);
  }

  function handleMenuSubmit() {
    confirmSaveModalProps.toggle();
  }

  async function onConfirmSaveMenu() {
    const saveData = merge(menuFormik.values, {
      topics: menuTopics.map((it) => it.id),
      learningWays: menuLearningWays.map((it) => it.id),
    });

    setSuccessMsg('');
    try {
      await centralHttp.post(API_PATHS.CATALOG_MENU, saveData);
      setSuccessMsg('Save catalog menu successfully.');
    } catch (error) {
      const errorMessages = getErrorMessages(error);
      setErrors(errorMessages);
    }
  }

  async function getCatalogMenu() {
    const res = await centralHttp.get(API_PATHS.CATALOG_MENU);
    const menu = res.data.data as CatalogMenu;
    menuFormik.setValues({
      topicHeadlineEn: menu.topicHeadline?.nameEn,
      topicHeadlineTh: menu.topicHeadline?.nameTh,
      learningWayHeadlineEn: menu.learningWayHeadline?.nameEn,
      learningWayHeadlineTh: menu.learningWayHeadline?.nameTh,
    });
    if (menu.topics && menu.topics.length) {
      setMenuTopics(menu.topics);
    }
    if (menu.learningWays && menu.learningWays.length) {
      setMenuLearningWays(menu.learningWays);
    }
  }

  function removeMenuTopic(topic) {
    setMenuTopics([...menuTopics.filter((it) => it !== topic)]);
  }

  function swapMenuTopic(currentIndex: number, newIndex: number) {
    const newTopicArray = swapElement(menuTopics, currentIndex, newIndex);
    setMenuTopics(newTopicArray);
  }

  function swapMenuLearningWay(currentIndex: number, newIndex: number) {
    const newLearningWayArray = swapElement(
      menuLearningWays,
      currentIndex,
      newIndex,
    );
    setMenuLearningWays(newLearningWayArray);
  }

  useEffect(() => {
    getCatalogMenu().catch(captureError);
  }, []);

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_CATALOG_MENU_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Catalog Menu Management</title>
        </Head>
        <div className="flex flex-col lg:flex-row">
          <div className="mb-4 lg:mb-0 lg:w-1/3 lg:pr-8 ">
            <h4 className="mb-4 text-subheading font-semibold">
              Selectable Items
            </h4>
            <form onSubmit={topicFormik.handleSubmit}>
              <InputSelect
                formik={topicFormik}
                name="topicIds"
                label={t('courseForm.topic')}
                value={topicInputValues}
                isAsync={true}
                isMulti={true}
                isSearchable={true}
                promiseOptions={getTopicOptions}
                placeholder={t('courseForm.pleaseSelect')}
                onBlur={topicFormik.handleBlur}
                selectClassWrapperName="my-4"
                onChange={(e) => {
                  onTopicsValueChange(e.target.value);
                  topicFormik.handleChange(e);
                }}
                error={
                  topicFormik.touched.topicIds && topicFormik.errors.topicIds
                }
              />
              <div className="lg:flex lg:justify-end">
                <div className="lg:w-1/2">
                  <Button type="submit" variant="primary" size="medium">
                    Add to menu
                  </Button>
                </div>
              </div>
            </form>
          </div>
          <div className="p-4 shadow lg:w-2/3">
            <form onSubmit={menuFormik.handleSubmit}>
              <h4 className="mb-4 text-subheading font-semibold">
                Topics in Catalog Menu
              </h4>
              <MenuItems
                items={menuTopics}
                handleSwapElement={swapMenuTopic}
                handleRemove={removeMenuTopic}
                emptyText="No topic in catalog menu"
              />
              <hr className="my-8" />
              <h4 className="mt-8 mb-4 text-subheading font-semibold">
                Ways of Learning in Catalog Menu
              </h4>
              <MenuItems
                items={menuLearningWays}
                handleSwapElement={swapMenuLearningWay}
                emptyText="No way of learning in catalog menu"
                preventDelete={true}
              />
              <hr className="my-8" />
              <h4 className="mb-4 text-subheading font-semibold">
                Custom Headline
              </h4>
              <div>
                <InputSection
                  formik={menuFormik}
                  name="topicHeadlineEn"
                  label="Topic Headline (English)"
                  placeholder="Topic"
                  inputWrapperClassName="my-4"
                  value={menuFormik.values.topicHeadlineEn}
                  error={
                    menuFormik.touched.topicHeadlineEn &&
                    menuFormik.errors.topicHeadlineEn
                  }
                  onChange={menuFormik.handleChange}
                  onBlur={menuFormik.handleBlur}
                />
                <InputSection
                  formik={menuFormik}
                  name="topicHeadlineTh"
                  label="Topic Headline (Thai)"
                  placeholder="หัวข้อ"
                  inputWrapperClassName="my-4"
                  value={menuFormik.values.topicHeadlineTh}
                  error={
                    menuFormik.touched.topicHeadlineTh &&
                    menuFormik.errors.topicHeadlineTh
                  }
                  onChange={menuFormik.handleChange}
                  onBlur={menuFormik.handleBlur}
                />
                <InputSection
                  formik={menuFormik}
                  name="learningWayHeadlineEn"
                  label="Way of Learning Headline (English)"
                  placeholder="Way of Learning"
                  inputWrapperClassName="my-4"
                  value={menuFormik.values.learningWayHeadlineEn}
                  error={
                    menuFormik.touched.learningWayHeadlineEn &&
                    menuFormik.errors.learningWayHeadlineEn
                  }
                  onChange={menuFormik.handleChange}
                  onBlur={menuFormik.handleBlur}
                />
                <InputSection
                  formik={menuFormik}
                  name="learningWayHeadlineTh"
                  label="Way of Learning Headline (Thai)"
                  placeholder="วิธีเรียน"
                  inputWrapperClassName="my-4"
                  value={menuFormik.values.learningWayHeadlineTh}
                  error={
                    menuFormik.touched.learningWayHeadlineTh &&
                    menuFormik.errors.learningWayHeadlineTh
                  }
                  onChange={menuFormik.handleChange}
                  onBlur={menuFormik.handleBlur}
                />
              </div>
              <div className="mt-8 lg:w-1/5">
                <Button type="submit" variant="primary" size="medium">
                  Save Menu
                </Button>
              </div>
              <SuccessMessage
                title={successMsg}
                onClearAction={() => setSuccessMsg('')}
              />
              <ErrorMessages
                messages={errors}
                onClearAction={() => setErrors([])}
              />
            </form>
          </div>
        </div>

        <ConfirmationModal
          body={<p>Are you sure for saving this catalog menu?</p>}
          header="Save Catalog Menu"
          onOk={onConfirmSaveMenu}
          isOpen={confirmSaveModalProps.isOpen}
          toggle={confirmSaveModalProps.toggle}
        />
      </AdminLayout>
    </AccessControl>
  );
};

export default ManageCatalogMenuPage;
