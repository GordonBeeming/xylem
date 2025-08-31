// redirects.js
const redirects = [
  {
    source: '/:path*.mdx',
    destination: '/:path*',
    permanent: true,
  },
  {
    source: '/blog/tags/:slug*',
    destination: '/tags/:slug*',
    permanent: true,
  },
  {
    source: '/blog/sitemap.xml',
    destination: '/sitemap.xml',
    permanent: true,
  },
  {
    source: '/blog/tymhkon-how-do-i-follow-what-s-happening-with-azure-devops',
    destination: '/blog/2018-09-24/tymhkon-how-do-i-follow-what-s-happening-with-azure-devops',
    permanent: true,
  },
  {
    source: '/blog/tymhkon-public-projects-in-azure-devops',
    destination: '/blog/2018-09-15/tymhkon-public-projects-in-azure-devops',
    permanent: true,
  },
  {
    source: '/blog/tymhkon-what-is-it',
    destination: '/blog/2018-09-08/tymhkon-what-is-it',
    permanent: true,
  },
  {
    source: '/blog/code-snippet-jsonpropertyconvertercs',
    destination: '/blog/2020-07-30/code-snippet-jsonpropertyconvertercs',
    permanent: true,
  },
  {
    source: '/blog/2020-journey-to-120',
    destination: '/blog/2020-05-20/2020-journey-to-120',
    permanent: true,
  },
  {
    source: '/blog/a-hello-world-for-vso-extensions',
    destination: '/blog/2015-06-18/a-hello-world-for-vso-extensions',
    permanent: true,
  },
  {
    source: '/blog/a-journey-worth-taking',
    destination: '/blog/2018-05-21/a-journey-worth-taking',
    permanent: true,
  },
  {
    source: '/blog/activating-your-windows-10',
    destination: '/blog/2014-10-06/activating-your-windows-10',
    permanent: true,
  },
  {
    source: '/blog/add-work-item-links-from-check-in-comments',
    destination: '/blog/2013-11-16/add-work-item-links-from-check-in-comments',
    permanent: true,
  },
  {
    source: '/blog/adding-routes-to-strava-and-then-to-garmin-devices',
    destination: '/blog/2019-02-16/adding-routes-to-strava-and-then-to-garmin-devices',
    permanent: true,
  },
  {
    source: '/blog/allow-project-users-to-manage-permissions-groups-in-azure-devops',
    destination: '/blog/2021-07-22/allow-project-users-to-manage-permissions-groups-in-azure-devops',
    permanent: true,
  },
  {
    source: '/blog/application-insights-for-windows-store-apps-in-azure-portal',
    destination: '/blog/2014-12-10/application-insights-for-windows-store-apps-in-azure-portal',
    permanent: true,
  },
  {
    source: '/blog/assign-a-azure-subscription-to-a-existing-user',
    destination: '/blog/2014-12-17/assign-a-azure-subscription-to-a-existing-user',
    permanent: true,
  },
  {
    source: '/blog/battling-to-join-insider-preview',
    destination: '/blog/2017-06-20/battling-to-join-insider-preview',
    permanent: true,
  },
  {
    source: '/blog/benchmarkdotnet-isboolean-method',
    destination: '/blog/2017-12-28/benchmarkdotnet-isboolean-method',
    permanent: true,
  },
  {
    source: '/blog/blazor-server-events-not-triggering-when-hosted-behind-cloudflare',
    destination: '/blog/2023-08-15/blazor-server-events-not-triggering-when-hosted-behind-cloudflare',
    permanent: true,
  },
  {
    source: '/blog/browsing-localhost-with-the-microsoft-edge-browser',
    destination: '/blog/2015-07-04/browsing-localhost-with-the-microsoft-edge-browser',
    permanent: true,
  },
  {
    source: '/blog/building-basic-azure-infrastructure-using-terraform',
    destination: '/blog/2022-08-04/building-basic-azure-infrastructure-using-terraform',
    permanent: true,
  },
  {
    source: '/blog/building-libraries-that-target-multiple-frameworks',
    destination: '/blog/2018-07-30/building-libraries-that-target-multiple-frameworks',
    permanent: true,
  },
  {
    source: '/blog/bulk-import-git-repositories-into-vststfs',
    destination: '/blog/2017-07-25/bulk-import-git-repositories-into-vststfs',
    permanent: true,
  },
  {
    source: '/blog/changing-the-theme-in-windows-10',
    destination: '/blog/2014-10-06/changing-the-theme-in-windows-10',
    permanent: true,
  },
  {
    source: '/blog/cleaning-up-the-taskbar-on-windows-10',
    destination: '/blog/2015-03-26/cleaning-up-the-taskbar-on-windows-10',
    permanent: true,
  },
  {
    source: '/blog/configuring-a-chocolatey-install',
    destination: '/blog/2014-10-28/configuring-a-chocolatey-install',
    permanent: true,
  },
  {
    source: '/blog/connecting-agents-to-tfs-using-integrated-security-on-http-from-external-domain',
    destination: '/blog/2017-08-06/connecting-agents-to-tfs-using-integrated-security-on-http-from-external-domain',
    permanent: true,
  },
  {
    source: '/blog/connecting-test-manager-to-vso',
    destination: '/blog/2015-05-22/connecting-test-manager-to-vso',
    permanent: true,
  },
  {
    source: '/blog/connecting-visual-studio-to-vso',
    destination: '/blog/2015-05-18/connecting-visual-studio-to-vso',
    permanent: true,
  },
  {
    source: '/blog/converting-html-to-pdf-using-c-and-magic',
    destination: '/blog/2017-05-22/converting-html-to-pdf-using-c-and-magic',
    permanent: true,
  },
  {
    source: '/blog/create-a-new-vso-account',
    destination: '/blog/2015-05-11/create-a-new-vso-account',
    permanent: true,
  },
  {
    source: '/blog/create-pfx-certificate-file-for-azure-web-apps-from-cloudflare-origin-cert-using-openssl',
    destination: '/blog/2020-03-24/create-pfx-certificate-file-for-azure-web-apps-from-cloudflare-origin-cert-using-openssl',
    permanent: true,
  },
  {
    source: '/blog/creating-fake-tfs-builds',
    destination: '/blog/2014-07-18/creating-fake-tfs-builds',
    permanent: true,
  },
  {
    source: '/blog/creating-a-checkpoint-vpn-connection-on-windows-81',
    destination: '/blog/2014-01-16/creating-a-checkpoint-vpn-connection-on-windows-81',
    permanent: true,
  },
  {
    source: '/blog/creating-a-new-azure-active-directory-user',
    destination: '/blog/2014-12-17/creating-a-new-azure-active-directory-user',
    permanent: true,
  },
  {
    source: '/blog/creating-a-new-branch-in-vsts',
    destination: '/blog/2018-03-10/creating-a-new-branch-in-vsts',
    permanent: true,
  },
  {
    source: '/blog/creating-a-vso-account-for-demos',
    destination: '/blog/2014-09-26/creating-a-vso-account-for-demos',
    permanent: true,
  },
  {
    source: '/blog/creating-an-asynchronous-authorizeattribute-in-mvc',
    destination: '/blog/2018-01-26/creating-an-asynchronous-authorizeattribute-in-mvc',
    permanent: true,
  },
  {
    source: '/blog/creating-an-azure-dashboard-for-application-insights-in-1-2-3',
    destination: '/blog/2018-12-12/creating-an-azure-dashboard-for-application-insights-in-1-2-3',
    permanent: true,
  },
  {
    source: '/blog/creating-iterations-in-vso',
    destination: '/blog/2015-05-25/creating-iterations-in-vso',
    permanent: true,
  },
  {
    source: '/blog/creating-your-first-vso-team-project',
    destination: '/blog/2015-05-15/creating-your-first-vso-team-project',
    permanent: true,
  },
  {
    source: '/blog/cryptographic-failure-while-signing-assembly',
    destination: '/blog/2014-01-03/cryptographic-failure-while-signing-assembly',
    permanent: true,
  },
  {
    source: '/blog/deploying-net-templates-using-github-actions',
    destination: '/blog/2023-11-05/deploying-net-templates-using-github-actions',
    permanent: true,
  },
  {
    source: '/blog/developing-software-for-the-modern-world-using-only-your-browser-and-github',
    destination: '/blog/2021-05-19/developing-software-for-the-modern-world-using-only-your-browser-and-github',
    permanent: true,
  },
  {
    source: '/blog/do-you-know-optional-parameters',
    destination: '/blog/2014-07-07/do-you-know-optional-parameters',
    permanent: true,
  },
  {
    source: '/blog/download-msva-content-with-powershell',
    destination: '/blog/2014-01-24/download-msva-content-with-powershell',
    permanent: true,
  },
  {
    source: '/blog/download-brian-kellers-vm-with-powershell',
    destination: '/blog/2014-01-10/download-brian-kellers-vm-with-powershell',
    permanent: true,
  },
  {
    source: '/blog/easily-adding-auditing-to-a-entity-framework-code-first-project',
    destination: '/blog/2017-01-05/easily-adding-auditing-to-a-entity-framework-code-first-project',
    permanent: true,
  },
  {
    source: '/blog/easily-download-ch9-videos',
    destination: '/blog/2014-04-10/easily-download-ch9-videos',
    permanent: true,
  },
  {
    source: '/blog/failover-or-restart-results-in-reseed-of-identity-fix',
    destination: '/blog/2015-01-07/failover-or-restart-results-in-reseed-of-identity-fix',
    permanent: true,
  },
  {
    source: '/blog/find-organizations-linked-to-your-aad-tenant-in-azure-devops',
    destination: '/blog/2019-12-10/find-organizations-linked-to-your-aad-tenant-in-azure-devops',
    permanent: true,
  },
  {
    source: '/blog/first-post-here',
    destination: '/blog/2013-10-22/first-post-here',
    permanent: true,
  },
  {
    source: '/blog/fixing-the-process-cannot-access-the-file-because-it-is-being-used-by-another-process-exception-from-hresult-0x80070020',
    destination: '/blog/2015-01-21/fixing-the-process-cannot-access-the-file-because-it-is-being-used-by-another-process-exception-from-hresult-0x80070020',
    permanent: true,
  },
  {
    source: '/blog/generating-code-documentation-using-ghost-doc-enterprise',
    destination: '/blog/2017-04-30/generating-code-documentation-using-ghost-doc-enterprise',
    permanent: true,
  },
  {
    source: '/blog/getting-start-with-a-team-explorer-plugin-for-vs-2013',
    destination: '/blog/2014-01-16/getting-start-with-a-team-explorer-plugin-for-vs-2013',
    permanent: true,
  },
  {
    source: '/blog/getting-start-with-a-team-explorer-plugin-for-vs-2013-part-2',
    destination: '/blog/2014-01-09/getting-start-with-a-team-explorer-plugin-for-vs-2013-part-2',
    permanent: true,
  },
  {
    source: '/blog/getting-start-with-a-team-explorer-plugin-for-vs-2013-part-3',
    destination: '/blog/2014-01-16/getting-start-with-a-team-explorer-plugin-for-vs-2013-part-3',
    permanent: true,
  },
  {
    source: '/blog/getting-start-with-a-team-explorer-plugin-for-vs-2013-part-4',
    destination: '/blog/2014-01-16/getting-start-with-a-team-explorer-plugin-for-vs-2013-part-4',
    permanent: true,
  },
  {
    source: '/blog/github-actions-ci-in-5-clicks',
    destination: '/blog/2019-08-19/github-actions-ci-in-5-clicks',
    permanent: true,
  },
  {
    source: '/blog/github-projects-and-issues',
    destination: '/blog/2022-05-23/github-projects-and-issues',
    permanent: true,
  },
  {
    source: '/blog/goodbye-microsoft-teams-bar-hello-productivity',
    destination: '/blog/2024-05-16/goodbye-microsoft-teams-bar-hello-productivity',
    permanent: true,
  },
  {
    source: '/blog/having-fun-with-github-codespaces-docker-swagger-codegen-cli',
    destination: '/blog/2021-02-02/having-fun-with-github-codespaces-docker-swagger-codegen-cli',
    permanent: true,
  },
  {
    source: '/blog/how-do-i-fix-http-error-5025-process-failure-when-hosting-in-iis-with-dotnet-core',
    destination: '/blog/2018-05-13/how-do-i-fix-http-error-5025-process-failure-when-hosting-in-iis-with-dotnet-core',
    permanent: true,
  },
  {
    source: '/blog/how-to-create-a-team-project-in-azure-devops',
    destination: '/blog/2020-09-21/how-to-create-a-team-project-in-azure-devops',
    permanent: true,
  },
  {
    source: '/blog/how-to-delete-a-team-project-in-azure-devops',
    destination: '/blog/2020-09-22/how-to-delete-a-team-project-in-azure-devops',
    permanent: true,
  },
  {
    source: '/blog/how-to-enable-alternate-credentials-in-visual-studio-online-vso',
    destination: '/blog/2015-01-16/how-to-enable-alternate-credentials-in-visual-studio-online-vso',
    permanent: true,
  },
  {
    source: '/blog/how-to-enforce-check-in-policies',
    destination: '/blog/2014-01-10/how-to-enforce-check-in-policies',
    permanent: true,
  },
  {
    source: '/blog/how-to-get-your-identity-tokens',
    destination: '/blog/2014-06-02/how-to-get-your-identity-tokens',
    permanent: true,
  },
  {
    source: '/blog/how-to-lower-the-real-cost-of-a-sql-server-virtual-machine-in-azure',
    destination: '/blog/2020-03-27/how-to-lower-the-real-cost-of-a-sql-server-virtual-machine-in-azure',
    permanent: true,
  },
  {
    source: '/blog/how-to-migrate-git-repositories-to-azure-devops',
    destination: '/blog/2020-09-23/how-to-migrate-git-repositories-to-azure-devops',
    permanent: true,
  },
  {
    source: '/blog/how-to-migrate-svn-and-tfvc-repositories-to-git-repositories-in-azure-devops',
    destination: '/blog/2020-09-24/how-to-migrate-svn-and-tfvc-repositories-to-git-repositories-in-azure-devops',
    permanent: true,
  },
  {
    source: '/blog/how-to-move-work-items-between-projects-in-azure-devops',
    destination: '/blog/2020-09-23/how-to-move-work-items-between-projects-in-azure-devops',
    permanent: true,
  },
  {
    source: '/blog/how-to-recovery-a-deleted-team-project-in-azure-devops',
    destination: '/blog/2020-09-22/how-to-recovery-a-deleted-team-project-in-azure-devops',
    permanent: true,
  },
  {
    source: '/blog/how-to-tweet-azure-pipeline-activity-easily',
    destination: '/blog/2018-09-20/how-to-tweet-azure-pipeline-activity-easily',
    permanent: true,
  },
  {
    source: '/blog/how-to-use-the-same-editor-as-visual-studio-code-in-your-sites',
    destination: '/blog/2020-08-12/how-to-use-the-same-editor-as-visual-studio-code-in-your-sites',
    permanent: true,
  },
  {
    source: '/blog/hubstt-will-save-your-life',
    destination: '/blog/2014-04-24/hubstt-will-save-your-life',
    permanent: true,
  },
  {
    source: '/blog/implementing-a-dynamic-robotstxt',
    destination: '/blog/2017-04-12/implementing-a-dynamic-robotstxt',
    permanent: true,
  },
  {
    source: '/blog/improving-your-git-efficiency-using-git-alias',
    destination: '/blog/2024-03-21/improving-your-git-efficiency-using-git-alias',
    permanent: true,
  },
  {
    source: '/blog/increase-the-value-of-your-dashboard-with-tfs-2013-update-2',
    destination: '/blog/2014-03-03/increase-the-value-of-your-dashboard-with-tfs-2013-update-2',
    permanent: true,
  },
  {
    source: '/blog/setting-up-nginx-on-azure-vms-behind-cloudflare-using-terraform',
    destination: '/blog/2022-08-17/setting-up-nginx-on-azure-vms-behind-cloudflare-using-terraform',
    permanent: true,
  },
  {
    source: '/blog/introduction-to-dotnet-pretty',
    destination: '/blog/2014-07-17/introduction-to-dotnet-pretty',
    permanent: true,
  },
  {
    source: '/blog/is-this-thing-on',
    destination: '/blog/2023-10-20/is-this-thing-on',
    permanent: true,
  },
  {
    source: '/blog/know-it-prove-it-28-days-to-rock-your-skills',
    destination: '/blog/2015-01-13/know-it-prove-it-28-days-to-rock-your-skills',
    permanent: true,
  },
  {
    source: '/blog/load-testing-using-azure',
    destination: '/blog/2015-10-08/load-testing-using-azure',
    permanent: true,
  },
  {
    source: '/blog/making-a-cake-day',
    destination: '/blog/2016-05-02/making-a-cake-day',
    permanent: true,
  },
  {
    source: '/blog/managing-github-secrets-using-terraform',
    destination: '/blog/2022-08-11/managing-github-secrets-using-terraform',
    permanent: true,
  },
  {
    source: '/blog/migrating-pipelines-and-releases-in-azure-devops',
    destination: '/blog/2020-09-29/migrating-pipelines-and-releases-in-azure-devops',
    permanent: true,
  },
  {
    source: '/blog/migrating-test-artifacts-and-all-other-work-item-types-using-the-azure-devops',
    destination: '/blog/2020-09-27/migrating-test-artifacts-and-all-other-work-item-types-using-the-azure-devops',
    permanent: true,
  },
  {
    source: '/blog/missing-ctrl-enter-in-visual-studio-to-commit-changes-here-s-how-you-can-add-it',
    destination: '/blog/2019-03-18/missing-ctrl-enter-in-visual-studio-to-commit-changes-here-s-how-you-can-add-it',
    permanent: true,
  },
  {
    source: '/blog/moving-application-insights-resources-between-subscriptions-in-azure',
    destination: '/blog/2018-01-03/moving-application-insights-resources-between-subscriptions-in-azure',
    permanent: true,
  },
  {
    source: '/blog/moving-repos-to-github-from-azure-devops-github-quick-tips',
    destination: '/blog/2022-01-17/moving-repos-to-github-from-azure-devops-github-quick-tips',
    permanent: true,
  },
  {
    source: '/blog/msb4019-microsoft-data-tools-schema-sqltasks-targets-was-not-found',
    destination: '/blog/2020-11-20/msb4019-microsoft-data-tools-schema-sqltasks-targets-was-not-found',
    permanent: true,
  },
  {
    source: '/blog/my-experience-with-codealike',
    destination: '/blog/2014-11-13/my-experience-with-codealike',
    permanent: true,
  },
  {
    source: '/blog/one-year-as-alm-ranger-and-first-day-as-alm-mvp',
    destination: '/blog/2014-07-02/one-year-as-alm-ranger-and-first-day-as-alm-mvp',
    permanent: true,
  },
  {
    source: '/blog/opening-apps-from-the-directory-you-in-as-administrator',
    destination: '/blog/2016-12-13/opening-apps-from-the-directory-you-in-as-administrator',
    permanent: true,
  },
  {
    source: '/blog/organize-your-music-collection',
    destination: '/blog/2014-07-16/organize-your-music-collection',
    permanent: true,
  },
  {
    source: '/blog/packt-publishing-celebrating-2000-titles',
    destination: '/blog/2014-03-24/packt-publishing-celebrating-2000-titles',
    permanent: true,
  },
  {
    source: '/blog/playing-with-azure-and-terraform',
    destination: '/blog/2022-09-01/playing-with-azure-and-terraform',
    permanent: true,
  },
  {
    source: '/blog/profile-readme-github-quick-tips',
    destination: '/blog/2021-08-11/profile-readme-github-quick-tips',
    permanent: true,
  },
  {
    source: '/blog/publish-aspnet-core-sites-to-azure-easily-using-github-actions',
    destination: '/blog/2020-03-23/publish-aspnet-core-sites-to-azure-easily-using-github-actions',
    permanent: true,
  },
  {
    source: '/blog/pushing-a-new-project-to-chocolatey',
    destination: '/blog/2014-10-28/pushing-a-new-project-to-chocolatey',
    permanent: true,
  },
  {
    source: '/blog/raising-awareness-and-reliable-information-sources-for-covid19-by-adding-a-banner-to-your-websites',
    destination: '/blog/2020-03-26/raising-awareness-and-reliable-information-sources-for-covid19-by-adding-a-banner-to-your-websites',
    permanent: true,
  },
  {
    source: '/blog/rethink-your-application-boundary-and-use-cloudflare',
    destination: '/blog/2020-10-21/rethink-your-application-boundary-and-use-cloudflare',
    permanent: true,
  },
  {
    source: '/blog/scanning-infrastructure-as-code-iac-for-vulnerabilities',
    destination: '/blog/2022-08-24/scanning-infrastructure-as-code-iac-for-vulnerabilities',
    permanent: true,
  },
  {
    source: '/blog/searching-in-vststfs',
    destination: '/blog/2017-08-06/searching-in-vststfs',
    permanent: true,
  },
  {
    source: '/blog/set-which-chrome-profile-for-visual-studio-to-use',
    destination: '/blog/2018-03-26/set-which-chrome-profile-for-visual-studio-to-use',
    permanent: true,
  },
  {
    source: '/blog/setting-up-net-core-continuous-integration-build-with-vststfs',
    destination: '/blog/2017-04-23/setting-up-net-core-continuous-integration-build-with-vststfs',
    permanent: true,
  },
  {
    source: '/blog/setting-up-2-factor-authentication-and-email-verification-with-net-core-20',
    destination: '/blog/2018-02-15/setting-up-2-factor-authentication-and-email-verification-with-net-core-20',
    permanent: true,
  },
  {
    source: '/blog/setting-up-a-standard-continuous-integration-build-with-vststfs',
    destination: '/blog/2017-04-23/setting-up-a-standard-continuous-integration-build-with-vststfs',
    permanent: true,
  },
  {
    source: '/blog/setting-up-commit-signature-verification-for-github',
    destination: '/blog/2022-03-21/setting-up-commit-signature-verification-for-github',
    permanent: true,
  },
  {
    source: '/blog/setting-up-tfs-build-agents-fast',
    destination: '/blog/2015-10-16/setting-up-tfs-build-agents-fast',
    permanent: true,
  },
  {
    source: '/blog/setting-wild-card-branch-policies-in-vsts',
    destination: '/blog/2018-03-10/setting-wild-card-branch-policies-in-vsts',
    permanent: true,
  },
  {
    source: '/blog/sharing-code-that-uses-application-insights',
    destination: '/blog/2014-05-14/sharing-code-that-uses-application-insights',
    permanent: true,
  },
  {
    source: '/blog/so-i-installed-vs-enterprise-2017-and-have-no-mtm-where-is-it',
    destination: '/blog/2017-03-08/so-i-installed-vs-enterprise-2017-and-have-no-mtm-where-is-it',
    permanent: true,
  },
  {
    source: '/blog/sql-prompt-64-release',
    destination: '/blog/2014-09-23/sql-prompt-64-release',
    permanent: true,
  },
  {
    source: '/blog/ssms-2016-where-have-my-line-breaks-gone',
    destination: '/blog/2016-07-25/ssms-2016-where-have-my-line-breaks-gone',
    permanent: true,
  },
  {
    source: '/blog/start-bitstransfer-object-reference-not-set-to-an-instance-of-an-object',
    destination: '/blog/2014-01-04/start-bitstransfer-object-reference-not-set-to-an-instance-of-an-object',
    permanent: true,
  },
  {
    source: '/blog/sys-internals-updater',
    destination: '/blog/2014-05-15/sys-internals-updater',
    permanent: true,
  },
  {
    source: '/blog/tf400324-team-foundation-services-are-not-available-from-server',
    destination: '/blog/2014-01-21/tf400324-team-foundation-services-are-not-available-from-server',
    permanent: true,
  },
  {
    source: '/blog/tf400917-the-current-configuration-is-not-valid-for-this-feature-this-feature-cannot-be-used-until-you-correct-the-configuration',
    destination: '/blog/2014-03-27/tf400917-the-current-configuration-is-not-valid-for-this-feature-this-feature-cannot-be-used-until-you-correct-the-configuration',
    permanent: true,
  },
  {
    source: '/blog/tfs-work-item-visualizers',
    destination: '/blog/2014-07-28/tfs-work-item-visualizers',
    permanent: true,
  },
  {
    source: '/blog/the-importance-of-regression-testing-and-real-world-security-consequences',
    destination: '/blog/2020-03-18/the-importance-of-regression-testing-and-real-world-security-consequences',
    permanent: true,
  },
  {
    source: '/blog/they-said-select-was-bad-but',
    destination: '/blog/2015-04-09/they-said-select-was-bad-but',
    permanent: true,
  },
  {
    source: '/blog/turning-on-local-cache-for-nuget',
    destination: '/blog/2014-09-25/turning-on-local-cache-for-nuget',
    permanent: true,
  },
  {
    source: '/blog/turning-on-the-new-navigation-for-visual-studio-team-services',
    destination: '/blog/2018-07-15/turning-on-the-new-navigation-for-visual-studio-team-services',
    permanent: true,
  },
  {
    source: '/blog/typescript-emit-error-write-to-file-failed',
    destination: '/blog/2013-11-15/typescript-emit-error-write-to-file-failed',
    permanent: true,
  },
  {
    source: '/blog/upgradepublish-tfs-2013-process-templates-with-powershell',
    destination: '/blog/2014-09-12/upgradepublish-tfs-2013-process-templates-with-powershell',
    permanent: true,
  },
  {
    source: '/blog/using-application-insights-with-a-new-windows-store-app',
    destination: '/blog/2014-02-18/using-application-insights-with-a-new-windows-store-app',
    permanent: true,
  },
  {
    source: '/blog/using-application-insights-with-an-existing-windows-store-app',
    destination: '/blog/2014-05-12/using-application-insights-with-an-existing-windows-store-app',
    permanent: true,
  },
  {
    source: '/blog/using-azure-resource-manager',
    destination: '/blog/2014-12-17/using-azure-resource-manager',
    permanent: true,
  },
  {
    source: '/blog/using-c-6-to-make-bad-sql-awesome',
    destination: '/blog/2017-02-09/using-c-6-to-make-bad-sql-awesome',
    permanent: true,
  },
  {
    source: '/blog/using-ngrok-to-test-web-apps-on-mobile-while-developing',
    destination: '/blog/2017-05-18/using-ngrok-to-test-web-apps-on-mobile-while-developing',
    permanent: true,
  },
  {
    source: '/blog/visual-studio-2012-paste-special-feature',
    destination: '/blog/2013-10-29/visual-studio-2012-paste-special-feature',
    permanent: true,
  },
  {
    source: '/blog/visual-studio-2013-update-1-released',
    destination: '/blog/2014-01-21/visual-studio-2013-update-1-released',
    permanent: true,
  },
  {
    source: '/blog/visual-studio-hangs-systemcertificates-fiddler',
    destination: '/blog/2014-02-25/visual-studio-hangs-systemcertificates-fiddler',
    permanent: true,
  },
  {
    source: '/blog/visual-studio-item-templates-vs-net-templates-in-2023',
    destination: '/blog/2023-10-29/visual-studio-item-templates-vs-net-templates-in-2023',
    permanent: true,
  },
  {
    source: '/blog/visual-studio-team-services-overview-video-series',
    destination: '/blog/2016-05-03/visual-studio-team-services-overview-video-series',
    permanent: true,
  },
  {
    source: '/blog/vsts-widget-for-github-badges',
    destination: '/blog/2016-01-28/vsts-widget-for-github-badges',
    permanent: true,
  },
  {
    source: '/blog/webinar-performance-tuning-net-sql-code-using-ants-profiler',
    destination: '/blog/2014-12-03/webinar-performance-tuning-net-sql-code-using-ants-profiler',
    permanent: true,
  },
  {
    source: '/blog/windows-insider-program-changes-to-terms-of-use',
    destination: '/blog/2015-01-15/windows-insider-program-changes-to-terms-of-use',
    permanent: true,
  },
  {
    source: '/blog/work-around-for-net-framework-47-or-a-later-update-is-already-installed-on-this-computer',
    destination: '/blog/2017-12-07/work-around-for-net-framework-47-or-a-later-update-is-already-installed-on-this-computer',
    permanent: true,
  },
  {
    source: '/blog/20250813/guide-to-mastering-github-copilot-on-github-com',
    destination: '/blog/2025-08-13/guide-to-mastering-github-copilot-on-github-com',
    permanent: true,
  },
];

export default redirects;