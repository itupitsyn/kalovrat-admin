import { FC, PropsWithChildren } from 'react';

import { AppPagination } from './app-pagination';

interface ITableWrapperProps extends PropsWithChildren {
  title: string;
  pagination?: {
    generateLink: (page: number) => string;
    totalItems: number;
    page: number;
  };
}

export const TableWrapper: FC<ITableWrapperProps> = ({ title, children, pagination }) => {
  return (
    <>
      <h1 className="ml-2 text-4xl font-semibold sm:ml-10">{title}</h1>

      <div className="ml-2 pt-10 sm:ml-10">
        <div className="overflow-x-auto">{children}</div>
        {pagination && (
          <AppPagination
            page={pagination.page}
            totalItems={pagination.totalItems}
            className="justify-start pt-6"
            generateLink={pagination.generateLink}
          />
        )}
      </div>
    </>
  );
};
