import { defineConfig } from 'vitepress'
import topics from './topics.json' with { type: 'json' }

export default defineConfig({
	lang: 'zh-CN',
	title: 'C++ 面试基础',
	description: '将 C++98 / C++11 面试知识归纳为 18 个主题，涵盖语言、对象、所有权、STL 与并发。',
	base: '/cppIF/',
	lastUpdated: true,
	themeConfig: {
		nav: [
			{ text: '首页', link: '/' },
			{ text: '主题总纲', link: '/overview' },
			{ text: '原文索引', link: '/source-map' }
		],
		sidebar: [
			{
				text: '阅读导航',
				items: [
					{ text: '主题总纲', link: '/overview' },
					{ text: '原文条目索引', link: '/source-map' }
				]
			},
			{ text: 'C++98 / C++11 知识体系', items: topics }
		],
		outline: { level: [2, 3], label: '本页目录' },
		search: { provider: 'local' },
		docFooter: { prev: '上一章', next: '下一章' },
		lastUpdated: { text: '最后更新' },
		returnToTopLabel: '返回顶部',
		sidebarMenuLabel: '章节目录',
		darkModeSwitchLabel: '切换主题',
		socialLinks: [{ icon: 'github', link: 'https://github.com/pe0128/cppIF' }],
		editLink: {
			pattern: 'https://github.com/pe0128/cppIF/edit/main/docs/:path',
			text: '在 GitHub 上编辑此页'
		},
		footer: { message: 'C++98 / C++11 · 按主题理解，按问题复习' }
	}
})
