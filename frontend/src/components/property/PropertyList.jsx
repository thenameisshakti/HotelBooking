import "./property.css"
import useFetch from "../../hooks/useFetch"

function PropertyList() {
  const {data,loading,error} = useFetch("/api/v1/hotels/type?type=apartment")
  // console.log(data)
  const type = ["Hotel","Apartment","Resort","villa","cabin",]
  const images =[
    "https://plus.unsplash.com/premium_photo-1670360414903-19e5832f8bc4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1469022563428-aa04fef9f5a2?q=80&w=2946&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1600619754865-8fe927da0701?q=80&w=896&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2950&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1568729937315-2ef5ee9cf4f2?q=80&w=3083&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    

  ]
  
  return (
     <div className="pList">
        { loading ? "please wait" :
        <>
        {data && images.map((img,i) => (
          <div className="pListItem" key={i}>
            <img 
            src={img}
            alt=""
            className="pListImg rounded-xl"
            />
            <div className="pListTitles">
              <h1>{type[i]}</h1>
              <h2>{data[i]} Options</h2>
            </div>
        </div>

        ))}
        
      
      </>}


     </div>
  )
}

export default PropertyList