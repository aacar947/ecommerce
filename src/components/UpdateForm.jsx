import '../styles/spinner.css';
import { useEffect, useRef, useState } from 'react';
import Form from './Form';
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

    if (onSubmit) onSubmit(e, formData);
  };

  return (
    <div className='justify-self-center'>
      <FormHeader title={title} successMsg={successMsg} errorMsg={errorMsg} submittingMsg={submittingMsg} />
      {headerContent}
      <Form {...rest} onSubmit={handleSubmit} inputs={inputs} onChange={onChange} noBtn>
        {children}
        <SubmitBtn submitText={rest.submitText} submitBtnClass={rest.submitBtnClass} />
      </Form>
    </div>
  );
}

function SubmitBtn({ submitText, submitBtnClass }) {
  const hasChanges = useUpdateFormContext((s) => s?.hasChanges);
  const { state } = useNavigation();
  return (
    <div className='btn-container'>
      <Btn className={submitBtnClass} type='submit' disabled={state === 'submitting' || !hasChanges}>
        {submitText}
      </Btn>
    </div>
  );
}

function FormHeader({ title, successMsg, errorMsg, submittingMsg }) {
  const navigation = useNavigation();
  const actionData = useUpdateFormContext((s) => s?.actionData);
  const toastId = useRef(null);
  const [updateState, setUpdateState] = useState(null);
  const _successMsg = typeof successMsg === 'function' ? successMsg(actionData) : successMsg;
  const _errorMsg = typeof errorMsg === 'function' ? errorMsg(actionData) : errorMsg;

  useEffect(() => {
    if (navigation.state === 'submitting') {
      toastId.current = toast.loading(submittingMsg);
      setUpdateState(STATES.submitting);
    } else if (navigation.state === 'idle' && actionData) {
      if (actionData.error) {
        setUpdateState(STATES.idle);
        toast.error(_errorMsg, { id: toastId.current });
      } else {
        toast.success(_successMsg, { id: toastId.current });
        setUpdateState(STATES.idle);
      }
    }
    return () => {
      if (toastId.current) toast.dismiss(toastId.current);
    };
  }, [navigation.state, actionData, setUpdateState, _successMsg, _errorMsg, submittingMsg]);

  return (
    <>
      <h2>{title}</h2>
      <div className='flex'>
        {updateState === 'idle' && !actionData?.error && actionData?.data && _successMsg && <div className='success-msg'>{_successMsg}</div>}
        {updateState === 'idle' && actionData?.error && _errorMsg && <div className='error-msg'>{_errorMsg}</div>}
        {updateState && updateState !== 'idle' && (
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
