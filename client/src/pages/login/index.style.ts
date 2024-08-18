import styled from 'styled-components'

const Styled = {
  LoginContainer: styled.div`
    width: 100%;
    max-width: 400px;
    margin: auto;
    padding: 50px 20px;
    background-color: #f0f4f7;
    border-radius: 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  `,
  FormContainer: styled.form`
    display: flex;  
    justify-content: center;
    align-items: center;
    flex-direction: column;
  `,
  SignUpButton: styled.button`
    width: 100%;
    height: 50px;
    cursor: pointer;
    margin-bottom: 10px;
    background-color: #00bcd4;
    color: white;
    border: none;
    border-radius: 25px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    font-size: 16px;
  `,
  Title: styled.div`
    text-align: center;
    font-weight: bold;
    font-size: 24px;
    color: #4caf50;
    margin-bottom: 24px;
  `,
  LoginButton: styled.button`
    width: 100%;
    height: 50px;
    margin: 10px 0;
    cursor: pointer;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 25px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    font-size: 16px;
  `,
  Errors: styled.div`
    color: red;
    margin-top: 10px;
    font-size: 14px;
  `
}
export default Styled
