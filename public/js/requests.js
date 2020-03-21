
const deleteProduct = (btn) => {
    const csrf = btn.parentElement.querySelector('[name="_csrf"]').value;
    const productId = btn.parentElement.querySelector('[name="productId"]').value;
    console.log("clicked", productId);
    const productElement = btn.closest('article');

    fetch('/admin/delete-product/'+ productId, {
        method:"DELETE",
        headers:{
            'csrf-token': csrf
        }
    })
    .then(data=>{
        return data.json();
    })
    .then(result=>{
        console.log(result);
        //remove it only when getting the response from the server
        productElement.parentNode.removeChild(productElement);
    })
    .catch(err=>console.log(err));
}