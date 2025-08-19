const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 text-gray-600">
      <div className="max-w-7xl mx-auto container-padding py-8">
        <div className="text-center">
          <p className="text-sm">
            © {currentYear} Yu-Sheng Tzou. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 