import "./featuredProperties.css"
import  useFetch from "../../hooks/useFetch"

function FeaturedProperties() {
    console.log("just before the calling from FeaturedProperties")
    const {data,loading,error} = useFetch("/api/v1/hotels/all")
    console.log(data,"the error solver")
   

  return (
   <div className="featured">
     { loading ? ("loading please wait") : 
     <>
     <div className="featuredItem">
        <img
          src="https://plus.unsplash.com/premium_photo-1697730426664-f04d9916f700?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className="featuredImg brightness-50"
        />
        <div className="featuredTitles font-extrabold text-2xl">
          <h1>North-India</h1>
          
        </div>
      </div>
      <div className="featuredItem">
        <img
          src="https://plus.unsplash.com/premium_photo-1697730388194-0f8f7943dbad?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className="featuredImg brightness-50"
        />
        <div className="featuredTitles font-extrabold text-2xl">
          <h1>West-India</h1>
          
        </div>
      </div>
      
      <div className="featuredItem">
        <img
          src="https://images.unsplash.com/photo-1615966192539-f1731963b19a?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className="featuredImg brightness-50"
        />
        <div className="featuredTitles font-extrabold text-2xl">
          <h1>East-India</h1>
          
        </div>
      </div>
      <div className="featuredItem">
        <img
          src="https://images.unsplash.com/photo-1625505826977-66d796089d73?q=80&w=3014&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className="featuredImg brightness-50"
        />
        <div className="featuredTitles font-extrabold text-2xl">
          <h1>South-India</h1>
          
        </div>
      </div>
      </>}
    </div>
  );
};


export default FeaturedProperties