import '../styles/form.css';
import { Form as routerForm, useNavigation } from 'react-router';
import Input from './Input';
import Btn from './Btn';

export default function Form({ fetcher, title, submitText, footer, submitBtnClass, inputs = [], onChange, disableBtn = false, noBtn = false, children, className, invalidMsgList, ...rest }) {
  const _Form = fetcher ? fetcher.Form : routerForm;
  return (
    <div className='form-wrapper'>
      <_Form {...rest} className={'styled-form flex' + (className ? ' ' + className : '')}>
        {title && <h2 className='form-title'>{title}</h2>}
        {inputs.map(
          ({ invalidMsg, size, name, active = true, ...rest }, i) => active && <Input key={name + i} name={name} invalidMsg={invalidMsg || (invalidMsgList && invalidMsgList[name])} onChange={onChange} mainClassName={size} {...rest} />
        )}
        {children}
        {noBtn ? null : <SubmitBtn fetcher={fetcher} submitText={submitText} submitBtnClass={submitBtnClass} disableBtn={disableBtn} />}
        {footer && <div className='footer'>{footer}</div>}
      </_Form>
    </div>
  );
}

function SubmitBtn({ submitText, submitBtnClass, disableBtn, fetcher }) {
  const { state } = useNavigation();
  return (
    <div className='btn-container'>
      <Btn className={submitBtnClass} type='submit' disabled={fetcher?.state === 'submitting' || state === 'submitting' || disableBtn}>
        {submitText}
      </Btn>
    </div>
  );
}
