const token = 'gz9Se7BNAEaynxwzlg46JGTXnLD2';
const api_path = 'teaegg';



let orderData = [];
let c3Data = [];


const init = async () =>{
    await getOrderList();
    renderOrderList(orderData);
    
}

const renderOrderList = (orderData) =>{
    let str = '';
    if(orderData.length === 0 && c3Data.length === 0){
        orderPageTbody.innerHTML =`<tr><td colspan='7'>目前無訂單<td></tr>`;
        nonOrder.textContent = '沒訂單 沒圖表 呵呵～' ;
        return ;
    }
        orderData.forEach((order,index)=>{
            const orderDate = convertTimes(order.createdAt)
            const productTitle = order.products && order.products.length > 0
            ? order.products.map(product => product.title).join(' | ')
            : '無產品資料';

    
            const content = `<tr>
                            <td>1008877347</td>
                            <td>
                              <p>${order.user.name}</p>
                              <p>${order.user.tel}</p>
                            </td>
                            <td>${order.user.address}</td>
                            <td>${order.user.email}</td>
                            <td>
                              <p>${productTitle}</p>
                            </td>
                            <td>${orderDate}</td>
                            <td class="orderStatus">
                              <a href="#" class="paid" data-id=${order.id}>${order.paid === true ? '已處理':'未處理'}</a>
                            </td>
                            <td>
                              <input type="button" class="delSingleOrder-Btn" value="刪除" data-id=${order.id}>
                            </td>
                        </tr>`
    
            str += content;
        })
    

    orderPageTbody.innerHTML = str;
}

const convertTimes = (timestamp) => {
    const date = new Date(timestamp * 1000); 
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

const getOrderList = async () => {
    let c3CategoryCount ={}
    const url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`;
    try{
        const res = await axios.get(url,{
            headers : {
                authorization :token
            }
        });
        orderData = res.data.orders;
        const categoryArray = res.data.orders.flatMap(order => 
            order.products.map(item => item.category)
        );
        categoryArray.forEach(item=>{
            c3CategoryCount[item] = (c3CategoryCount[item] || 0)  +1;
        })
        c3Data = (Object.entries(c3CategoryCount));

        renderC3();
        

        console.log('getOrderSuccess',res);
    }catch(err){
        console.log('errorGetOrder',err);
    }
}

init()

const orderPageTbody = document.querySelector('.orderPage-table tbody');

const deleteItemfromOder = async (id) =>{
    let c3CategoryCount ={}
    const url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`
    const token = {
        headers : {
            authorization : 'gz9Se7BNAEaynxwzlg46JGTXnLD2'
        }
    }
    try{
        const res = await axios.delete(url,token);
        orderData = res.data.orders;
       const category = orderData.flatMap(item => 
        item.products.map(item => item.category));

        category.forEach(item=>{
            c3CategoryCount[item] = (c3CategoryCount[item] ||0) +1;
        })
        c3Data = (Object.entries(c3CategoryCount));
        renderC3();
        console.log('successDeleteOrder',res);
    }catch(err){
        console.log('errorDeleteOrder',err);
    }
}


orderPageTbody.addEventListener('click',async (e)=>{
    if(e.target.classList.contains('delSingleOrder-Btn')){
        const orderId = e.target.dataset.id;
       await deleteItemfromOder(orderId);
       renderOrderList(orderData);
    }
    if(e.target.classList.contains('paid')){
        e.preventDefault();
        const data = {data:{}};
        const orderId = e.target.dataset.id;
        const status = e.target.textContent;
        if(status === '未處理'){
            data.data.id = orderId;
            data.data.paid = true;
            await editOrderStatus(data);
            renderOrderList(orderData);
        }else if(status === '已處理'){
            data.data.id = orderId;
            data.data.paid = false;
            await editOrderStatus(data);
            renderOrderList(orderData);
        }
    }
})


const nonOrder = document.querySelector('.non-order');

// C3.js
function renderC3(){
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: c3Data,
            colors:{
                "床架":"#DACBFF",
                "收納":"#9D7FEA",
                "窗簾": "#5434A7",
            }
        },
    });
}


const editOrderStatus = async (data) =>{
    const url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`
    // const data = {
    //     data: {
    //         id: id,
    //         paid: paid
    //       }
    // }
    const token = {
        headers: {
            authorization :'gz9Se7BNAEaynxwzlg46JGTXnLD2'
        }
    }
    try{
        const res = await axios.put(url,data,token);
        orderData = res.data.orders;
        console.log('successEditOrder', res);
    }catch(err){
        console.log('errorEditOrder',err);
    }
}


const deleteAllfromOrder = async () =>{
    const url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`;
    const token ={
        headers :{
            authorization : 'gz9Se7BNAEaynxwzlg46JGTXnLD2'
        }
    }
    try{
        const res = await axios.delete(url,token);
        orderData = [];
        c3Data =[];
        renderC3();
        console.log('successDeleteAllOrder',res);
    }catch(err){
        console.log('errorDeleteAllOrder',err);
    }
}

const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',async (e)=>{
    e.preventDefault();
    await deleteAllfromOrder();
    renderOrderList(orderData);
})


