interface PageTitleProps {
  title: string
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  return (
    <div>
      <h1 className='text-2xl font-bold pb-[30px]'>{title}</h1>
    </div>
  )
}

export default PageTitle
