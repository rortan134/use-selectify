export default function Header() {
  return (
    <header className="flex w-full flex-shrink-0 select-none justify-center">
      <div className="w-[900px] min-w-0 max-w-full pl-24">
        <div className="mt-20 mb-2 flex h-6 flex-wrap text-slate-800/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button className="mx-1 inline-flex min-w-0 items-center whitespace-nowrap rounded-md p-1.5 text-xs transition-colors hover:bg-slate-100">
            <svg
              viewBox="0 0 14 14"
              className="mr-2 block h-4 w-4 flex-shrink-0 fill-slate-800/50"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7 0c3.861 0 7 3.139 7 7s-3.139 7-7 7-7-3.139-7-7 3.139-7 7-7zM3.561 5.295a1.027 1.027 0 1 0 2.054 0 1.027 1.027 0 0 0-2.054 0zm5.557 1.027a1.027 1.027 0 1 1 0-2.054 1.027 1.027 0 0 1 0 2.054zm1.211 2.816a.77.77 0 0 0-.124-1.087.786.786 0 0 0-1.098.107c-.273.407-1.16.958-2.254.958-1.093 0-1.981-.55-2.244-.945a.788.788 0 0 0-1.107-.135.786.786 0 0 0-.126 1.101c.55.734 1.81 1.542 3.477 1.542 1.668 0 2.848-.755 3.476-1.541z"
              ></path>
            </svg>
            Add icon
          </button>
          <button className="mx-1 inline-flex min-w-0 items-center whitespace-nowrap rounded-md p-1.5 text-xs transition-colors hover:bg-slate-100">
            <svg
              viewBox="0 0 14 14"
              className="mr-2 block h-4 w-4 flex-shrink-0 fill-slate-800/50"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm0 12h10L8.5 5.5l-2 4-2-1.5L2 12z"
              ></path>
            </svg>
            Add cover
          </button>
          <button className="mx-1 inline-flex min-w-0 items-center whitespace-nowrap rounded-md p-1.5 text-xs transition-colors hover:bg-slate-100">
            <svg
              viewBox="0 0 16 16"
              className="mr-2 block h-4 w-4 flex-shrink-0 fill-slate-800/50"
            >
              <path d="M4.095 15.465c.287 0 .499-.137.84-.444l2.523-2.277 4.47.007c2.058 0 3.214-1.19 3.214-3.22V4.22c0-2.03-1.156-3.22-3.213-3.22H3.213C1.163 1 0 2.19 0 4.22V9.53c0 2.037 1.196 3.22 3.165 3.213h.273v1.983c0 .45.24.738.657.738zM3.958 5.156a.454.454 0 01-.444-.45c0-.24.198-.438.444-.438h7.157c.246 0 .445.198.445.437a.45.45 0 01-.445.451H3.958zm0 2.256a.454.454 0 01-.444-.451c0-.24.198-.444.444-.444h7.157a.448.448 0 010 .895H3.958zm0 2.256a.448.448 0 010-.896h4.669c.246 0 .437.206.437.452a.438.438 0 01-.437.444H3.958z"></path>
            </svg>
            Add comment
          </button>
        </div>
        <h1
          className="w-full max-w-full whitespace-pre-wrap break-words p-1 text-4xl font-semibold text-slate-800 caret-slate-900"
          spellCheck="true"
          contentEditable="true"
          placeholder="Untitled"
        >
          use-selectify notion demo
        </h1>
      </div>
    </header>
  );
}
