/**
 * Content Versions Hook
 * Hook لإدارة النسخ المحفوظة للمحتوى
 */

import { trpc } from '@/lib/api/trpc';

export function useContentVersions() {
  const createVersion = trpc.content.contentVersions.create.useMutation();
  const getVersions = trpc.content.contentVersions.list.useQuery;
  const getVersion = trpc.content.contentVersions.get.useQuery;
  const getLatestVersion = trpc.content.contentVersions.getLatest.useQuery;
  const deleteVersion = trpc.content.contentVersions.delete.useMutation();
  const deleteAllVersions = trpc.content.contentVersions.deleteAll.useMutation();

  return {
    createVersion,
    getVersions,
    getVersion,
    getLatestVersion,
    deleteVersion,
    deleteAllVersions,
  };
}
