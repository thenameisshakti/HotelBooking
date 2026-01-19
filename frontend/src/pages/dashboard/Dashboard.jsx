import React from 'react'
import Navbar from '../../components/navbar/Navbar'
import MailList from '../../components/mailList/MailList'
import Footer from '../../components/footer/Footer'
import Headers from '../../components/header/Header'

function Dashboard() {
  return (
    <>
    <Navbar/>
    <Headers type= "dashboard"/>
    <MailList/>
    <Footer/>
    </>
  )
}

export default Dashboard