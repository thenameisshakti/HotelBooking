import "./mailList.css"

function MailList() {
  return (
      <div className="mail">
      <h1 className="mailTitle font-extrabold text-4xl">Save time, save money!</h1>
      <span className="mailDesc">Sign up and we'll send the best deals to you</span>
      <div className="mailInputContainer border">
        <input type="text" placeholder="Enter Your Email Here " className="cursor-pointer focus:outline-none" />
        <button className="p-3">Subscribe</button>
      </div>
    </div>
  )
}

export default MailList