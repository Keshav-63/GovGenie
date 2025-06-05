const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = "",
  bodyClassName = "",
  headerClassName = "",
  footerClassName = "",
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-dark-100 rounded-lg shadow-card hover:shadow-card-hover transition-shadow duration-300 ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${headerClassName}`}>
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}

      <div className={`p-6 ${bodyClassName}`}>{children}</div>

      {footer && (
        <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${footerClassName}`}>{footer}</div>
      )}
    </div>
  )
}

export default Card

