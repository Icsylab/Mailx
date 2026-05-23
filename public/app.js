const emailDatabase = [
            {
                id: 1,
                sender: "Sarah Jenkins",
                email: "sarah.j@vertex-ventures.io",
                initials: "SJ",
                subject: "Seed Round Term Sheet Refinement",
                time: "10:24 AM",
                unread: true,
                isSent: false,
                isDraft: true,
                body: "Hey team, I put together our notes from yesterday's product roadmap call with the technical partners. We need to lock in the final engineering headcount expansions detailed in Appendix B before closing the contract on Friday. Let me know if you can sync up for 15 minutes this afternoon.",
                tags: [{text: "Action Required", type: "tag-action"}, {text: "Funding", type: "tag-casual"}],
                aiReplies: {
                    agree: "Hi Sarah,\n\nThanks for refining this. I have looked over the expansion counts in Appendix B and they match our core hiring forecasts completely. I am free to hop on a sync call anytime after 2 PM today to lock this down.\n\nBest,\nUser",
                    decline: "Hi Sarah,\n\nThanks for sending this over. Unfortunately, our engineering roadmap for the current quarter is locked, and we can't expand the headcount metrics right now.\n\nBest,\nUser",
                    later: "Hi Sarah,\n\nReceived. I am routing this file directly through our operations team to verify constraints. Will drop a calendar invite once we clear alignment.\n\nBest,\nUser"
                }
            },
            {
                id: 2,
                sender: "Alex Rivers (Design)",
                email: "rivers@mailx.sh",
                initials: "AR",
                subject: "Figma Component System v2.4 (Review)",
                time: "Yesterday",
                unread: true,
                isSent: false,
                isDraft: true,
                body: "Hey! Just published the production-ready interactive micro-interactions for the smart dashboard module layout. The components match the glassmorphism parameters and contain optimized responsive layouts for review.",
                tags: [{text: "Design Review", type: "tag-review"}],
                aiReplies: {
                    agree: "Hey Alex,\n\nThe prototype animations look incredibly smooth! The glass blur parameters align perfectly with our frontend styling system guidelines. Approved to merge.\n\nThanks,\nUser",
                    decline: "Hey Alex,\n\nThanks for the update. Let's tone down the backdrop blur intensity slightly to save system processing overhead across standard device types.\n\nBest,\nUser",
                    later: "Hey Alex,\n\nGreat work here. I'm currently pulled into infrastructure syncs but will go deep into the prototype flows tomorrow morning to give explicit feedback.\n\nCheers,\nUser"
                }
            },
            {
                id: 3,
                sender: "Vercel Deployments",
                email: "noreply@vercel.com",
                initials: "VC",
                subject: "Production Build Successful: mailx-app-main",
                time: "May 19",
                unread: false,
                isSent: true,
                isDraft: false,
                body: "Project: mailx-dashboard\nBranch: main\nCommit: [feat] Optimized system canvas rendering state trees.\nDeployment URL has finished processing and is propagating globally across multi-region server arrays.",
                tags: [{text: "Automated", type: "tag-casual"}],
                aiReplies: {
                    agree: "System log confirmation acknowledged. All validation tests green across targeted production clusters.",
                    decline: "Alert pipeline exception: Reverting build tracking parameter metrics immediately.",
                    later: "Queued for automatic performance profiling snapshot routines next cycle."
                }
            }
        ];

        // Core App Layout States
        let currentTab = 'inbox';
        let activeEmailId = null;
        let activeIntent = 'agree';

        // Interface Selectors
        const loginPage = document.getElementById('login-page');
        const appDashboard = document.getElementById('app-dashboard');
        const loginBtn = document.getElementById('login-trigger-btn');
        const logoutBtn = document.getElementById('logout-trigger-btn');
        const emailFeed = document.getElementById('email-feed');
        const inboxTitle = document.getElementById('inbox-title');
        const navItems = document.querySelectorAll('.nav-menu .nav-item');
        const searchBar = document.getElementById('search-bar');

        const viewSubject = document.getElementById('view-subject');
        const viewAvatar = document.getElementById('view-avatar');
        const viewSender = document.getElementById('view-sender');
        const viewMeta = document.getElementById('view-meta');
        const viewBody = document.getElementById('view-body');
        const aiDraftOutput = document.getElementById('ai-draft-output');
        const aiDrawer = document.getElementById('ai-drawer');
        const intentPills = document.querySelectorAll('.intent-pill');
        const btnRegenerate = document.getElementById('btn-regenerate');
        const btnSendReply = document.getElementById('btn-send-reply');

        // Initial Auth Workflows
        loginBtn.addEventListener('click', () => {
            loginPage.style.opacity = '0';
            loginPage.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                loginPage.classList.add('hidden');
                appDashboard.classList.remove('hidden');
                updateUnreadBadge();
                renderEmailList();
                if(emailDatabase.length > 0) selectEmail(emailDatabase[0].id);
            }, 300);
        });

        logoutBtn.addEventListener('click', () => {
            appDashboard.classList.add('hidden');
            loginPage.classList.remove('hidden');
            loginPage.style.opacity = '1';
        });

        // Compute Side Badge Metrics
        function updateUnreadBadge() {
            const count = emailDatabase.filter(e => e.unread).length;
            document.getElementById('inbox-badge').textContent = count;
        }

        // Master Dynamic List Renderer
        function renderEmailList(query = '') {
            emailFeed.innerHTML = '';
            
            let filtered = emailDatabase.filter(email => {
                if (currentTab === 'unread') return email.unread;
                if (currentTab === 'sent') return email.isSent;
                if (currentTab === 'ai-drafts') return email.isDraft;
                if (currentTab === 'settings') return false; // Settings view placeholder
                return true; // default Inbox Tab
            });

            if (query) {
                filtered = filtered.filter(e => 
                    e.sender.toLowerCase().includes(query.toLowerCase()) || 
                    e.subject.toLowerCase().includes(query.toLowerCase()) || 
                    e.body.toLowerCase().includes(query.toLowerCase())
                );
            }

            if(filtered.length === 0) {
                emailFeed.innerHTML = `<div style="padding: 24px; color: var(--text-muted); font-size: 0.9rem; text-align: center;">No emails found matching view parameters.</div>`;
                return;
            }

            filtered.forEach(email => {
                const card = document.createElement('div');
                card.className = `email-card ${email.id === activeEmailId ? 'selected' : ''} ${email.unread ? 'unread' : ''}`;
                card.onclick = () => selectEmail(email.id);

                let tagsHTML = email.tags.map(t => `<span class="ai-tag ${t.type}">${t.text}</span>`).join('');
                
                card.innerHTML = `
                    <div class="avatar">${email.initials}</div>
                    <div class="email-meta">
                        <div class="email-top-row">
                            <span class="sender-name">${email.sender}</span>
                            <span class="timestamp">${email.time}</span>
                        </div>
                        <div class="subject-line">${email.subject} ${email.unread ? '<span class="unread-dot"></span>':''}</div>
                        <div class="body-preview">${email.body}</div>
                        <div class="tag-container">${tagsHTML}</div>
                    </div>
                `;
                emailFeed.appendChild(card);
            });
        }

        // Focus Detail & AI Response Processor
        function selectEmail(id) {
            activeEmailId = id;
            const email = emailDatabase.find(e => e.id === id);
            if(!email) return;

            // Clear unread status
            if(email.unread) {
                email.unread = false;
                updateUnreadBadge();
            }

            // Highlighting setup
            document.querySelectorAll('.email-card').forEach(c => c.classList.remove('selected'));
            renderEmailList(searchBar.value);

            // Populating Text Nodes
            viewSubject.textContent = email.subject;
            viewAvatar.textContent = email.initials;
            viewSender.textContent = email.sender;
            viewMeta.textContent = `From: ${email.email} • ${email.time}`;
            viewBody.textContent = email.body;

            // Load AI draft text matrix
            aiDrawer.classList.remove('hidden');
            loadAIDraft();
        }

        function loadAIDraft() {
            const email = emailDatabase.find(e => e.id === activeEmailId);
            if (email && email.aiReplies) {
                aiDraftOutput.value = email.aiReplies[activeIntent] || "";
            }
        }

        // Intent Pill Switching Loop
        intentPills.forEach(pill => {
            pill.addEventListener('click', () => {
                intentPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                activeIntent = pill.getAttribute('data-intent');
                loadAIDraft();
            });
        });

        // Search Control System
        searchBar.addEventListener('input', (e) => {
            renderEmailList(e.target.value);
        });

        // Sidebar View Toggle Switches
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.id === 'logout-trigger-btn') return;
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                currentTab = item.getAttribute('data-tab');
                inboxTitle.textContent = currentTab.replace('-', ' ');
                
                renderEmailList();
                // Select first matching item if present
                let filtered = emailDatabase.filter(email => {
                    if (currentTab === 'unread') return email.unread;
                    if (currentTab === 'sent') return email.isSent;
                    if (currentTab === 'ai-drafts') return email.isDraft;
                    return true;
                });
                if(filtered.length > 0) selectEmail(filtered[0].id);
            });
        });

        // Action Handlers
        btnRegenerate.addEventListener('click', () => {
            aiDraftOutput.style.opacity = '0.4';
            setTimeout(() => {
                aiDraftOutput.style.opacity = '1';
                loadAIDraft();
            }, 400);
        });

        btnSendReply.addEventListener('click', () => {
            const target = emailDatabase.find(e => e.id === activeEmailId);
            alert(`Response safely processed and sent to ${target ? target.sender : 'recipient'}.`);
        });