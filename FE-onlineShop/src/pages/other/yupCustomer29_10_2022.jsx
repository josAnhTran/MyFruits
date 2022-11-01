import React from 'react'
import styles from './css/Customers.module.css';
import * as yup from 'yup';
import userSchema from '../../validations/customerValidation';
function Customers() {

  const createUser = async (event) =>{
    event.preventDefault();
    let formData = {
      name: event.target[0].value,
      email: event.target[1].value,
      password: event.target[2].value
    };
    // console.log(formData);
    const isValid = await userSchema.isValid(formData);
    console.log(isValid)
  };
  

  return (
    <div className={styles.container}>
    <form className={styles.form} onSubmit = {createUser}>
      <input type='text' placeholder= 'Name...' />
      <input type='text' placeholder= 'Email...' />
      <input type='text' placeholder= 'password...' />
      <input type='submit' />
    </form>
    </div>
  )
}

export default Customers