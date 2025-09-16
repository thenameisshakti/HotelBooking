import Featured from "../../components/featured/Featured.jsx"
import Navbar from '../../components/navbar/Navbar'
import Header from '../../components/header/Header'
import './home.css'
import PropertyList from "../../components/property/propertyList.jsx"
import FeaturedProperties from "../../components/featuedProperties/FeaturedProperties.jsx"
import MailList from "../../components/mailList/MailList.jsx"
import Footer from "../../components/footer/Footer.jsx"

function Home() {
  return(
    <div>
      <Navbar />
      <Header />
      <div className="homeContainer">
       <FeaturedProperties />
        <h1 className="homeTitle">Browser by property type</h1>
        <PropertyList />
        <h1 className="homeTitle">Homes guests love</h1>
         <Featured />
         <MailList />
         <Footer />
      </div>
    </div>
  )
}

export default Home