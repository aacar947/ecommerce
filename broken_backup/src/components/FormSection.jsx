import Logo from '../components/Logo';
import Form from '../components/Form';
export default function FormSection({ fetcher, name, footer, submitText, submitBtnClass, requirements = [], children, ...rest }) {
  return (
    <section className='form-section center-all flex-col'>
      <Logo size='64px' />
      <div className='form-container'>
        <Form fetcher={fetcher} title={name} submitText={submitText} footer={footer} submitBtnClass={submitBtnClass} inputs={requirements} {...rest}>
          {children}
        </Form>
      </div>
    </section>
  );
}
