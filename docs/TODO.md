# Performance Issues
It seems like the routes get compiled only when I click on them. This shouldn't happen. They should be compiled at startup.

This seems to be true also for the sections. E.g. if i go into manag and click on projects, it takes a while to get there the first time, but after, not.

This is the console:

 ✓ Starting...
 ✓ Ready in 6.6s
 ○ Compiling / ...
 ✓ Compiled / in 12.9s (549 modules)
 ✓ Compiled in 1095ms (279 modules)
 GET / 200 in 14216ms
 ○ Compiling /works ...
 ✓ Compiled /works in 3.2s (547 modules)
 ✓ Compiled /about in 351ms (551 modules)
 ✓ Compiled /contact in 402ms (558 modules)
 ○ Compiling /manage ...
 ✓ Compiled /manage in 1061ms (576 modules)
 ○ Compiling /api/admin/content ...
 ✓ Compiled /api/admin/content in 677ms (330 modules)
 GET /api/admin/content 200 in 926ms
 GET /api/admin/content 200 in 25ms
 ○ Compiling /manage/projects ...
 ✓ Compiled /manage/projects in 602ms (617 modules)
 ✓ Compiled /api/admin/projects in 310ms (337 modules)
 GET /api/admin/projects 200 in 470ms
 GET /api/admin/projects 200 in 27ms
 ○ Compiling /manage/resume ...
 ✓ Compiled /manage/resume in 560ms (625 modules)
 GET /api/admin/content 200 in 40ms
 GET /api/admin/content 200 in 27ms
 ○ Compiling /manage/social ...
 ✓ Compiled /manage/social in 638ms (631 modules)
 GET /api/admin/content 200 in 38ms
 GET /api/admin/content 200 in 24ms
 GET /api/admin/content 200 in 30ms
 GET /api/admin/content 200 in 28ms
 GET /api/admin/projects 200 in 32ms
 GET /api/admin/projects 200 in 26ms
 GET /api/admin/content 200 in 30ms
 GET /api/admin/content 200 in 22ms
 GET /api/admin/projects 200 in 28ms
 GET /api/admin/projects 200 in 26ms
 ✓ Compiled /api/admin/projects/reorder in 325ms (347 modules)
 PUT /api/admin/projects/reorder 200 in 468ms
 PUT /api/admin/projects/reorder 200 in 28ms
 PUT /api/admin/projects/reorder 200 in 24ms
 PUT /api/admin/projects/reorder 200 in 23ms
 GET /api/admin/content 200 in 35ms


# Remove Slug from the user's view
They don't know what that is. Just do it under the hood and that's it.
Be sure to manage unique constraits accordingly after the modification.

# Resume must have option to add new section

# Add some way to handle order in which landing page images are viewed