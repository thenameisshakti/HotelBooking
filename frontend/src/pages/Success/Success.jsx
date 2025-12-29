
import {useLocation, useSearchParams }from "react-router-dom"
function PaymentSuccess() {
    
    const location = useLocation()
    const searchQuery = useSearchParams()[0]
    const Payment_id = searchQuery.get("pay")
    const Order_id  = searchQuery.get('order')
  return (
  
        <div className='border-1 grid h-screen place-content-center 
        bg-[url(https://images.unsplash.com/photo-1511389026070-a14ae610a1be?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)]
        bg-black/50'
        > 
            <div className='p-2 grid place-items-start'>
            <div className='font-extrabold text-2xl text-green-700'>
                Your room has been successfully booked! Thank you for choosing US.
            </div>
         
            <div>Payment id : {Payment_id}</div>
            <div>Booking id : {Order_id}</div>
            </div>
       
        </div>
    
  )
}

export default PaymentSuccess