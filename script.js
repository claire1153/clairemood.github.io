// 全局变量
let currentDate = new Date();
let selectedMood = null;
let currentUser = 'guest';

// 用户数据存储
const users = JSON.parse(localStorage.getItem('users') || '{}');

// 初始化当前用户
function initCurrentUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        document.getElementById('current-user').textContent = currentUser;
    }
}

// 心情表情映射
const moodEmojis = {
    great: '😊',
    good: '🙂',
    neutral: '😐',
    bad: '😞',
    terrible: '😢'
};

// 心情文字映射
const moodTexts = {
    great: '很棒',
    good: '不错',
    neutral: '一般',
    bad: '不好',
    terrible: '很糟'
};

// 初始化
function init() {
    try {
        // 初始化当前用户
        initCurrentUser();
        
        // 加载保存的心情数据
        loadMoodData();
        
        // 初始化日历
        generateCalendar();
        
        // 绑定事件
        bindEvents();
        
        // 绑定用户相关事件
        bindUserEvents();
    } catch (error) {
        console.error('初始化错误:', error);
        alert('初始化时出现错误，请刷新页面重试');
    }
}

// 绑定事件
function bindEvents() {
    // 心情按钮点击
    document.querySelectorAll('.mood-buttons button').forEach(button => {
        button.addEventListener('click', function() {
            // 移除其他按钮的active状态
            document.querySelectorAll('.mood-buttons button').forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的active状态
            this.classList.add('active');
            // 保存选中的心情
            selectedMood = this.dataset.mood;
        });
    });
    
    // 保存按钮点击
    document.getElementById('save-btn').addEventListener('click', saveMood);
    
    // 月份切换按钮
    document.getElementById('prev-month').addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar();
    });
}

// 绑定用户相关事件
function bindUserEvents() {
    const modal = document.getElementById('user-modal');
    const userBtn = document.getElementById('user-btn');
    const closeBtn = document.querySelector('.close');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    // 打开模态框
    userBtn.addEventListener('click', function() {
        modal.style.display = 'block';
    });
    
    // 关闭模态框
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
    
    // 标签切换
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有标签的active状态
            tabBtns.forEach(b => b.classList.remove('active'));
            // 添加当前标签的active状态
            this.classList.add('active');
            
            // 隐藏所有内容
            document.getElementById('login-tab').style.display = 'none';
            document.getElementById('register-tab').style.display = 'none';
            
            // 显示当前标签的内容
            document.getElementById(`${this.dataset.tab}-tab`).style.display = 'block';
        });
    });
    
    // 登录
    loginBtn.addEventListener('click', function() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username] && users[username] === password) {
            // 登录成功
            currentUser = username;
            localStorage.setItem('currentUser', currentUser);
            document.getElementById('current-user').textContent = currentUser;
            modal.style.display = 'none';
            
            // 重新加载数据
            reloadUserData();
            alert('登录成功！');
        } else {
            alert('用户名或密码错误');
        }
    });
    
    // 注册
    registerBtn.addEventListener('click', function() {
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        
        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username]) {
            alert('用户名已存在');
            return;
        }
        
        // 注册成功
        users[username] = password;
        localStorage.setItem('users', JSON.stringify(users));
        
        // 自动登录
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        document.getElementById('current-user').textContent = currentUser;
        modal.style.display = 'none';
        
        // 重新加载数据
        reloadUserData();
        alert('注册成功！');
    });
}

// 重新加载用户数据
function reloadUserData() {
    // 重置表单
    document.querySelectorAll('.mood-buttons button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('note').value = '';
    selectedMood = null;
    
    // 加载用户数据
    loadMoodData();
    
    // 更新日历
    generateCalendar();
    
    // 清空详情
    document.getElementById('details-content').innerHTML = '选择一个日期查看详情';
}

// 保存心情
function saveMood() {
    if (!selectedMood) {
        alert('请选择心情');
        return;
    }
    
    const note = document.getElementById('note').value;
    const today = getDateString(new Date());
    
    // 获取现有数据
    let userMoodData = JSON.parse(localStorage.getItem(`moodData_${currentUser}`) || '{}');
    
    // 保存今天的心情
    userMoodData[today] = {
        mood: selectedMood,
        note: note,
        timestamp: new Date().getTime()
    };
    
    // 保存到本地存储
    localStorage.setItem(`moodData_${currentUser}`, JSON.stringify(userMoodData));
    
    // 更新日历
    generateCalendar();
    
    // 显示成功消息
    alert('保存成功！');
    
    // 重置表单
    document.querySelectorAll('.mood-buttons button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('note').value = '';
    selectedMood = null;
}

// 加载心情数据
function loadMoodData() {
    // 检查本地存储是否有数据
    const userMoodData = JSON.parse(localStorage.getItem(`moodData_${currentUser}`) || '{}');
    
    // 检查今天是否已有心情记录
    const today = getDateString(new Date());
    if (userMoodData[today]) {
        const todayMood = userMoodData[today].mood;
        // 选中对应的心情按钮
        document.querySelector(`button[data-mood="${todayMood}"]`).classList.add('active');
        selectedMood = todayMood;
        // 填充笔记
        document.getElementById('note').value = userMoodData[today].note || '';
    }
}

// 生成日历
function generateCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthElement = document.getElementById('current-month');
    
    // 设置当前月份标题
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    currentMonthElement.textContent = `${year}年${month + 1}月`;
    
    // 清空日历网格
    calendarGrid.innerHTML = '';
    
    // 获取当月第一天
    const firstDay = new Date(year, month, 1);
    // 获取当月最后一天
    const lastDay = new Date(year, month + 1, 0);
    // 获取当月第一天是星期几（0-6，0是周日）
    const startDay = firstDay.getDay();
    // 获取当月的天数
    const daysInMonth = lastDay.getDate();
    
    // 添加上个月的占位天数
    for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day', 'empty');
        calendarGrid.appendChild(emptyDay);
    }
    
    // 获取心情数据
    const userMoodData = JSON.parse(localStorage.getItem(`moodData_${currentUser}`) || '{}');
    const today = getDateString(new Date());
    
    // 添加当月的天数
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;
        
        // 生成当前日期的字符串
        const dateString = getDateString(new Date(year, month, day));
        
        // 标记今天
        if (dateString === today) {
            dayElement.classList.add('today');
        }
        
        // 检查是否有心情记录
        if (userMoodData[dateString]) {
            const mood = userMoodData[dateString].mood;
            dayElement.classList.add('has-mood', `mood-${mood}`);
        }
        
        // 添加点击事件
        dayElement.addEventListener('click', function() {
            showMoodDetails(dateString);
        });
        
        calendarGrid.appendChild(dayElement);
    }
}

// 显示心情详情
function showMoodDetails(dateString) {
    const detailsContent = document.getElementById('details-content');
    const userMoodData = JSON.parse(localStorage.getItem(`moodData_${currentUser}`) || '{}');
    
    if (userMoodData[dateString]) {
        const mood = userMoodData[dateString].mood;
        const note = userMoodData[dateString].note || '无';
        const emoji = moodEmojis[mood];
        const moodText = moodTexts[mood];
        
        detailsContent.innerHTML = `
            <p><strong>日期：</strong>${dateString}</p>
            <p><strong>心情：</strong>${emoji} ${moodText}</p>
            <p><strong>记录：</strong>${note}</p>
        `;
    } else {
        detailsContent.innerHTML = `
            <p><strong>日期：</strong>${dateString}</p>
            <p>该日期没有心情记录</p>
        `;
    }
}

// 获取日期字符串（YYYY-MM-DD）
function getDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 初始化应用
init();