import { defineConfig } from 'vitepress'
import topics from './topics.json' with { type: 'json' }

export default defineConfig({
	lang: 'zh-CN',
	title: 'C++ 笔记',
	description: 'C++98、C++11、C++14、C++17、C++20和C++23 的语法、用法与使用条件。',
	base: '/cppIF/',
	rewrites: { 'versions/cpp98.md': 'index.md' },
	lastUpdated: true,
	themeConfig: {
		nav: [
			{ text: 'C++98', link: '/' },
			{ text: 'C++11', link: '/versions/cpp11' },
			{ text: 'C++14', link: '/versions/cpp14' },
			{ text: 'C++17', link: '/versions/cpp17' },
			{ text: 'C++20', link: '/versions/cpp20' },
			{ text: 'C++23', link: '/versions/cpp23' }
		],
		sidebar: [
			{
				text: '标准版本',
				items: [
					{ text: 'C++98', link: '/' },
					{ text: 'C++11', link: '/versions/cpp11' },
					{ text: 'C++14', link: '/versions/cpp14' },
					{ text: 'C++17', link: '/versions/cpp17' },
					{ text: 'C++20', link: '/versions/cpp20' },
					{ text: 'C++23', link: '/versions/cpp23' }
				]
			},
			{ text: 'C++98和C++11 详细知识点', items: topics }
		],
		outline: { level: [2, 3], label: '本页目录' },
		search: {
			provider: 'local',
			options: {
				translations: {
					button: { buttonText: '搜索笔记', buttonAriaLabel: '搜索笔记' },
					modal: {
						noResultsText: '没有找到相关笔记',
						resetButtonTitle: '清除搜索',
						footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
					}
				}
			}
		},
		docFooter: { prev: '上一章', next: '下一章' },
		lastUpdated: { text: '最后更新' },
		returnToTopLabel: '返回顶部',
		sidebarMenuLabel: '章节目录',
		darkModeSwitchLabel: '切换主题',
		socialLinks: [{ icon: 'github', link: 'https://github.com/pe0128/cppIF' }],
		editLink: {
			pattern: 'https://github.com/pe0128/cppIF/edit/main/docs/:path',
			text: '在 GitHub 上编辑此页'
		}
	}
})
