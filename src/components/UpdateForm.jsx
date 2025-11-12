import '../styles/spinner.css';
import { useEffect, useRef, useState } from 'react';
import Form from './Form';
import useUser from '../hooks/useUser';
import toast from 'react-hot-toast';
import UpdateFormProvider from '../contexts/UpdateFormProvider';
import useUpdateFormContext from '../hooks/useUpdateFormContext';
import Btn from './Btn';
import { useNavigation } from 'react-router';

const STATES = {
  submitting: 'submitting',
  idle: 'idle',
};

export default function UpdateForm(props) {
  return (
    <UpdateFormProvider>
      <UpdateFromContent {...props} />
    </UpdateFormProvider>
  );
}

function UpdateFromContent({ inputs = [], title = '', onSubmit, headerContent, successMsg = 'Updated successfully.', errorMsg = 'Something went wrong.', submittingMsg = 'Updating...', children, ...rest }) {
  const fetcher = useUpdateFormContext((s) => s?.fetcher);
  const setHasChanges = useUpdateFormContext((s) => s?.setHasChanges);
  const updateChanges = useUpdateFormContext((s) => s?.updateChanges);
  const changedFieldsRef = useUpdateFormContext((s) => s?.changedFieldsRef);

  useEffect(() => {
    changedFieldsRef.current = {};
    setHasChanges(false);
  }, [inputs]);

  const onChange = (e) => {
    const { name, value, defaultValue } = e.target;
    if (!name) return;
    const dataDefault = e.target.getAttribute('data-default') || '';
    const prevValue = defaultValue || dataDefault || '';
    const isChanged = value !== prevValue;

    if (isChanged) {
      changedFieldsRef.current[name] = value;
    } else {
      delete changedFieldsRef.current[name];
    }

    updateChanges();
  };

  const handleSubmit = (e) => {
    const formData = new FormData();
    for (const [name, value] of Object.entries(changedFieldsRef.current)) {
      if (!value) continue;
      if (Array.isArray(value)) value.forEach((v) => formData.append(name, v));
      else formData.append(name, value);
    }

    if (onSubmit) onSubmit(e, formData, fetcher);
  };

  return (
    <div className='justify-self-center'>
      <FormHeader title={title} successMsg={successMsg} errorMsg={errorMsg} submittingMsg={submittingMsg} />
      {headerContent}
      <Form {...rest} onSubmit={handleSubmit} fetcher={fetcher} inputs={inputs} onChange={onChange} noBtn>
        {children}
        <SubmitBtn submitText={rest.submitText} submitBtnClass={rest.submitBtnClass} />
      </Form>
    </div>
  );
}

function SubmitBtn({ submitText, submitBtnClass }) {
  const fetcher = useUpdateFormContext((s) => s?.fetcher);
  const hasChanges = useUpdateFormContext((s) => s?.hasChanges);
  const { state } = useNavigation();
  return (
    <div className='btn-container'>
      <Btn className={submitBtnClass} type='submit' disabled={fetcher?.state === 'submitting' || state === 'submitting' || !hasChanges}>
        {submitText}
      </Btn>
    </div>
  );
}

function FormHeader({ title, successMsg, errorMsg, submittingMsg }) {
  const fetcher = useUpdateFormContext((s) => s?.fetcher);
  const toastId = useRef(null);
  const refreshUser = useUser((s) => s.refreshUser);
  const [updateState, setUpdateState] = useState(null);

  useEffect(() => {
    if (fetcher.state === 'submitting') {
      toastId.current = toast.loading(submittingMsg);
      setUpdateState(STATES.submitting);
    } else if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.error) {
        setUpdateState(STATES.idle);
        toast.error(errorMsg, { id: toastId.current });
      } else {
        refreshUser();
        toast.success(successMsg, { id: toastId.current });
        setUpdateState(STATES.idle);
      }
    }
    return () => {
      if (toastId.current) toast.dismiss(toastId.current);
    };
  }, [fetcher.state, fetcher.data, refreshUser]);

  return (
    <>
      <h2>{title}</h2>
      <div className='flex'>
        {updateState === 'idle' && !fetcher.data?.error && fetcher.data?.data && <div className='success-msg'>{successMsg}</div>}
        {updateState === 'idle' && fetcher.data?.error && <div className='error-msg'>{errorMsg}</div>}
        {updateState && (
          <div className={'loader ' + STATES[updateState]}>
            <div className='spinner'>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
