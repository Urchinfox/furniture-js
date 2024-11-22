
const token = 'gz9Se7BNAEaynxwzlg46JGTXnLD2';
const api_path = 'teaegg';

let productData = []
let cartData = [];
let finalPrice = 0;



const init = async () =>{
    await getProductList();
    renderProductWrap(productData);
    await getCartItems();
    renderCart(cartData,finalPrice);
}
const getProductList = async () =>{
    const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`;
    try{
        const res = await axios.get(url);
        productData = res.data.products;
    }catch(err){
        console.log(err);
    }
}


const productWrap = document.querySelector('.productWrap');
const renderProductWrap = (data) =>{
    let str = '';
    data.forEach(item =>{
        const content = `<li class="productCard">
                <h4 class="productType">${item.category}</h4>
                <img src=${item.images} alt="...">
                <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
            </li>`
            str += content;
    })
    productWrap.innerHTML = str;
}

init();

// -------------------filter product --------------------
const productSelect = document.querySelector('.productSelect');

productSelect.addEventListener('change',(e)=>{
    if(e.target.value === '全部'){
        renderProductWrap(productData);
    }else{
        const filterArr = productData.filter(item =>{
            return item.category === e.target.value;
        })
        renderProductWrap(filterArr);
    }
})


// -------------------cart function --------------------
const shoppingCartTbody = document.querySelector('.shoppingCart tbody');
const shoppingCartFoot = document.querySelector('.shoppingCart tfoot');

productWrap.addEventListener('click', async (e)=>{
    if(e.target.classList.contains('addCardBtn')){
        e.preventDefault();
        productId = e.target.dataset.id;
        await addItemToCart(productId);
        renderCart(cartData,finalPrice);
    }
})

shoppingCartTbody.addEventListener('click', async (e)=>{

    if (e.target.classList.contains('material-icons')) {
        e.preventDefault();
        const productId = e.target.dataset.id;

        const makeSure = await Swal.fire({
            title: "確欸？",
            text: "還真的不結帳哦!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "下次下次APT!"
        });

        if (makeSure.isConfirmed) {
            try {
                await deleteItemFromCart(productId);
                renderCart(cartData, finalPrice);
                Swal.fire({
                    title: "已刪除!",
                    text: "你會後悔～～.",
                    icon: "success"
                });
            } catch (error) {
                console.error("Error deleting item:", error);
                Swal.fire({
                    title: "Error!",
                    text: "There was a problem deleting the item.",
                    icon: "error"
                });
            }
        }
    }
})

let cartItemQuantity = {data:{}};
shoppingCartTbody.addEventListener('change',(e)=>{

    if(e.target.classList.contains('quantity-input')){
        cartItemQuantity.data.quantity = Number(e.target.value);
        cartItemQuantity.data.id = e.target.dataset.id;
        changeItemAmountFromCart(cartItemQuantity);
    }
})


// data: {
//     id: "JucjQgBb4jIkFiT3ypDe",
//     quantity : 1
// }

shoppingCartFoot.addEventListener('click',async (e)=>{
    if(e.target.classList.contains('discardAllBtn')){
        e.preventDefault(); 
        if(cartData.length === 0){
            Swal.fire({
                title: "購物車沒產品啦",
                text: "請先放一點進來 sir?",
                icon: "question"
              });
            return ;
        }
        const makeSure = await Swal.fire({
            title: "Seriously？",
            text: "刪除全部的全部嗎!？",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "確定的確定!"
        });
        if (makeSure.isConfirmed) {
            try {
                await deleteAllItems();        
                renderCart(cartData, finalPrice);
                Swal.fire({
                    title: "Go! please ^^",
                    text: "你這ㄇ的窮光蛋蛋",
                    icon: "success"
                });
            } catch (error) {
                console.error("Error deleting item:", error);
                Swal.fire({
                    title: "Error!",
                    text: "There was a problem deleting the item.",
                    icon: "error"
                });
            }
        }


    }
})

const renderCart = (cartData, finalPrice) =>{
    let str = ''
    if(cartData.length !== 0){
        cartData.forEach(item=>{
                const content = `
                <tr>
                    <td>
                        <div class="cardItem-title">
                            <img src=${item.product.images} alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${item.product.origin_price}</td>
                      <td>
                    <input 
                    type="number" 
                    class="quantity-input" 
                    data-id="${item.id}" 
                    min="1" 
                    value="${item.quantity}"style="width:40px">
                    </td>
                    <td>NT$${item.product.price}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons" data-id = ${item.id}>
                            clear
                        </a>
                    </td>
                </tr>`
                str += content; 
        })
        document.querySelector('.shoppingCart tfoot .finalPrice').textContent = finalPrice;
        shoppingCartTbody.innerHTML = str;

    }else if(cartData.length === 0){
        shoppingCartTbody.innerHTML = '購物車無任何商品';
        document.querySelector('.shoppingCart tfoot .finalPrice').textContent = finalPrice;
    }
    
}



// -------------------form --------------------
const orderForm = {
    data:{
        user:{
            name:'',
            email:'',
            address:'',
            tel:'',
            payment:'請選擇付款方式'
        }
    }
};
const orderInfo = document.querySelector('.orderInfo-form');
const orderInfoSubmit = document.querySelector('.orderInfo-btn');
orderInfo.addEventListener('change',(e)=>{
    inputId = e.target.id;
    if(inputId === 'customerName'){
        orderForm.data.user.name = e.target.value;
    }else if(inputId === 'customerEmail'){
        orderForm.data.user.email = e.target.value;
    }else if(inputId === 'customerAddress'){
        orderForm.data.user.address = e.target.value;
    }else if(inputId ==='customerPhone'){
        orderForm.data.user.tel = e.target.value;
    }else if(inputId === 'tradeWay'){
        orderForm.data.user.payment = e.target.value;
    }
})

orderInfoSubmit.addEventListener('click',(e)=>{
    e.preventDefault();
    const userInfo = orderForm.data.user;
    if(userInfo.name === ''){
        alert('請填入姓名');
        return;
    }else if(userInfo.email === ''){
        alert('請填入email');
        return;
    }else if(userInfo.tel === ''){
        alert('請輸入電話')
        return ;
    }else if(userInfo.address === ''){
        alert('請輸入地址')
        return ;
    }else if(userInfo.payment ==='請選擇付款方式'){
        alert('請選擇付款方式')
        return ;
    }else{
        submitOrder();
    }
})
const submitOrder = async () =>{
    await placeOrder(orderForm);
    if(cartData.length === 0){
        Swal.fire({
            title: "購物車沒產品啦",
            text: "請先放一點進來 sir?",
            icon: "question"
          });
        return;
    }else{
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
        });
        Toast.fire({
        icon: "success",
        title: "下單成功 不准退貨"
        });
        cartData =[];
        renderCart(cartData);
        orderInfo.reset();
    }
    
 
}


// api below 

const getCartItems = async() => {
    const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`;
    try{
        const res = await axios.get(url)
        cartData = res.data.carts;
        finalPrice = res.data.finalTotal;
        console.log(res);
    }catch(err){
        console.log(err);
    }
}

const addItemToCart = async (productId) => {
    const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`;
    try{
        const data = {
            data: {
                productId: productId,
                quantity: 1
              }
        }
        const res = await axios.post(url,data,)
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "已放入只加不買的購物車",
            showConfirmButton: false,
            timer: 2000
          });
        cartData = res.data.carts;
        finalPrice = res.data.finalTotal;
        console.log('success to Cart',res);
    }catch(err){
        console.log('unsuccess to cart',err);
    }
}

const changeItemAmountFromCart = async (data) =>{
    const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`;
    try{
        const res = await axios.patch(url,data);
        cartData = res.data.carts
        console.log('changeQuantitySuccess',res);
    }catch(err){
        console.log('errorToChange',err);
    }
}

const deleteItemFromCart = async (id) =>{
    try{
        const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${id}`;
        
        const res = await axios.delete(url);
        cartData = res.data.carts;
        finalPrice = res.data.finalTotal;
        
        console.log('item deleted',res);
    }catch(err){
        throw err;
        console.log('errorDeleteItem',err);
    }
}

const deleteAllItems = async () => {
    const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`;
    try{
        const res = await axios.delete(url);
        cartData = res.data.carts;
        finalPrice = 0;
        console.log('allItemDeleted',res);
    }catch(err){
        throw err;
        console.log('errorToDeleteAll',err);
    }
}

const placeOrder = async (formData) => {
    const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`;
    try{
        const res = await axios.post(url,formData);
        submitFalse = true;
        console.log('successPlaceOrder', res);
    }catch(err){
        console.log('errorPlaceOrder',err);
    }
}





