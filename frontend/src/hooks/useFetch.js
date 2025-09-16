import {useEffect, useState} from "react"
import axios from "axios"

function useFetch(url) {
    console.log(`${url} this url`)
    const [data ,setData] = useState([])
    const[loading,setLoading] = useState(false)
    const [error,setError] = useState(null)


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try{
                console.log(`we are in useFetch useEffect response is received and we set our data now ${url}`)
                const response = await axios.get(url)
                
                setData(response.data.data)

             }catch(error){
                console.log("error at fetching the link ",error)
                setError(error)
            }
            setLoading(false )
        }
        fetchData()
    } , [])

    const reFetch = async() =>{
        setLoading(true)
        try{
            console.log(`refectch is used for get data to set from  ${url}`)
            const response = await axios.get(url)
            
            setData(response.data.data)
        }catch(error) {
            console.log(`faild to get response in refetch  `)
        }
        setLoading(false)
    }
  return {data,loading,error,reFetch}
}

export default useFetch