const axios = require('axios');
const {URLCategory} = require('./constants')

//GET ALL CATEGORIES
// Cach 1:  export async function getUser(){}  khong can module.exports....
// Cach 2:
const  getAllCategories= async() =>{
    try {
      const response = await axios.get(`${URLCategory}/searchs`);
      return response.data
    } catch (error) {
      console.error(error);
    }
  }
//

// Update function
const onUpdate = async (values) => {
  const data = values.data
  const id = values.id
  const url = `${URLCategory}/update-one/${id}`;

  try{
      const response = await axios.patch(url, data)
      console.log('Update a category successfully!')
  }catch(err){
      console.log(err)
      console.log('Update FAILED')
  }
}
//

// Insert a new Category function
const onAddOneCategoryAsync = async (values) => {
  const url = `${URLCategory}/insert-one`;
  try{
      const response = await axios.post(url, values)
      console.log('Add a new category successfully!')
  }catch(err){
      console.log(err)
      console.log('Update FAILED')
  }
}
//





// Delete One Category
const deleteOne= async({id, name}) => { 
  if(! window.confirm(`Bạn có muốn xóa danh mục ${name}?`)){
    console.log('ok')
    return
  }

  const urlDelete = `${URLCategory}/delete-id/${id}`
  try{
    const response = await axios.delete(urlDelete)
    console.log('test response: ', response)

  } catch(error){
    console.error('test error: ',error);
  }
}
//


module.exports={  
    getAllCategories,
    onUpdate,
    deleteOne,
    onAddOneCategoryAsync
  }