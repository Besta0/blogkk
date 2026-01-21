const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-gray-950/40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {year} Caleb Tan. All rights reserved.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Built with React + TypeScript.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

