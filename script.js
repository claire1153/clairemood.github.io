// 全局变量
let currentDate = new Date();
let selectedMood = null;

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
        // 加载保存的心情数据
        loadMoodData();
        
        // 初始化日历
        generateCalendar();
        
        // 绑定事件
        bindEvents();
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

// 保存心情
function saveMood() {
    if (!selectedMood) {
        alert('请选择心情');
        return;
    }
    
    const note = document.getElementById('note').value;
    const today = getDateString(new Date());
    
    // 获取现有数据
    let moodData = JSON.parse(localStorage.getItem('moodData') || '{}');
    
    // 保存今天的心情
    moodData[today] = {
        mood: selectedMood,
        note: note,
        timestamp: new Date().getTime()
    };
    
    // 保存到本地存储
    localStorage.setItem('moodData', JSON.stringify(moodData));
    
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
    const moodData = JSON.parse(localStorage.getItem('moodData') || '{}');
    
    // 检查今天是否已有心情记录
    const today = getDateString(new Date());
    if (moodData[today]) {
        const todayMood = moodData[today].mood;
        // 选中对应的心情按钮
        document.querySelector(`button[data-mood="${todayMood}"]`).classList.add('active');
        selectedMood = todayMood;
        // 填充笔记
        document.getElementById('note').value = moodData[today].note || '';
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
    const moodData = JSON.parse(localStorage.getItem('moodData') || '{}');
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
        if (moodData[dateString]) {
            const mood = moodData[dateString].mood;
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
    const moodData = JSON.parse(localStorage.getItem('moodData') || '{}');
    
    if (moodData[dateString]) {
        const mood = moodData[dateString].mood;
        const note = moodData[dateString].note || '无';
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